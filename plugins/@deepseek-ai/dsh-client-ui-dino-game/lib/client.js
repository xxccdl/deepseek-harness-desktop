// Dino Jump — the browser half.
//
// A small endless runner rendered into the frame-wide `shell.overlay` slot.
// That layer is click-through by design, so the game panel is the only thing
// that takes pointer events; everything else in the app keeps working
// underneath it.
//
// It keeps to the published plugin contract: a module-loader entry, one slot
// registration, and no dependencies beyond react and the host's own services.
window.__ModuleLoader__.load({
	id: "@deepseek-ai/dsh-client-ui-dino-game",
	factory: (require) => {
		var module = { exports: {} };
		var exports = module.exports;
		Object.defineProperty(exports, Symbol.toStringTag, { value: "Module" });
		const react = require("react");

		const NS = "ui-dino-game";

		// ── geometry ──────────────────────────────────────────────────────────
		/** Canvas backing size, in CSS pixels. */
		const W = 340;
		const H = 170;
		/** y of the ground line; the dino stands on it. */
		const GROUND = 138;
		/** Dino box. `y` is 0 on the ground and negative in the air. */
		const DINO_X = 40;
		const DINO_W = 22;
		const DINO_H = 24;
		/** Physics, in pixels per tick. */
		const GRAVITY = 0.9;
		const JUMP_V = -11.2;
		/** Horizontal speed ramps from the first value to the second. */
		const SPEED_MIN = 4.4;
		const SPEED_MAX = 9.5;
		/** One game tick, in milliseconds. */
		const TICK_MS = 16;
		/** Ticks per displayed score point. */
		const TICKS_PER_POINT = 4;
		/** localStorage key holding the best score. */
		const BEST_KEY = "dsh.dino-game.best";

		// ── copy ──────────────────────────────────────────────────────────────
		// The market build ships one language; the dynamic-plugin draft carried a
		// locale dictionary, and these are the zh strings from it.
		const TEXT = {
			title: "小恐龙跳跃",
			jump: "跳跃",
			restart: "重新开始",
			score: "得分",
			best: "最高",
			tip: "空格 / 点击 跳跃",
			mute: "静音",
			sound: "音效",
			hide: "收起",
			show: "小恐龙"
		};

		// ── styles ────────────────────────────────────────────────────────────
		const CSS = [
			".dg-root{position:fixed;right:20px;bottom:20px;z-index:60;pointer-events:auto;font-family:inherit;}",
			".dg-panel{width:340px;border-radius:14px;overflow:hidden;background:var(--dsw-alias-bg-elevated,#fff);border:1px solid var(--dsw-alias-border-secondary,rgba(0,0,0,.1));box-shadow:0 12px 32px rgba(0,0,0,.18);}",
			".dg-head{display:flex;align-items:center;gap:8px;padding:8px 10px;font-size:13px;font-weight:600;color:var(--dsw-alias-text-primary,#111);border-bottom:1px solid var(--dsw-alias-border-secondary,rgba(0,0,0,.08));}",
			".dg-head .dg-sp{flex:1;}",
			".dg-score{font-variant-numeric:tabular-nums;font-weight:600;color:var(--dsw-alias-text-secondary,#555);font-size:12px;}",
			".dg-btn{cursor:pointer;border:1px solid var(--dsw-alias-border-secondary,rgba(0,0,0,.12));background:transparent;color:var(--dsw-alias-text-primary,#111);border-radius:8px;padding:3px 9px;font-size:12px;line-height:1.4;font-family:inherit;}",
			".dg-btn:hover{background:var(--dsw-alias-bg-secondary,rgba(0,0,0,.05));}",
			".dg-btn.dg-primary{background:var(--dsw-alias-brand-primary,#4d6bfe);border-color:transparent;color:#fff;}",
			".dg-canvas{display:block;width:100%;height:170px;background:var(--dsw-alias-bg-secondary,rgba(0,0,0,.03));cursor:pointer;outline:none;}",
			".dg-canvas:focus-visible{box-shadow:inset 0 0 0 2px var(--dsw-alias-brand-primary,#4d6bfe);}",
			".dg-foot{display:flex;align-items:center;gap:8px;padding:7px 10px;font-size:11px;color:var(--dsw-alias-text-secondary,#666);border-top:1px solid var(--dsw-alias-border-secondary,rgba(0,0,0,.08));}",
			".dg-foot .dg-sp{flex:1;}",
			".dg-chip{position:fixed;right:20px;bottom:20px;z-index:60;pointer-events:auto;cursor:pointer;border:none;border-radius:999px;padding:8px 14px;font-size:13px;font-weight:600;font-family:inherit;color:#fff;background:var(--dsw-alias-brand-primary,#4d6bfe);box-shadow:0 8px 20px rgba(0,0,0,.22);}",
			".dg-chip:hover{filter:brightness(1.06);}"
		].join("\n");

		// ── state ─────────────────────────────────────────────────────────────
		/** Fresh game state. `y` is the dino's offset from the ground. */
		function freshState() {
			return {
				y: 0,
				vy: 0,
				onGround: true,
				tick: 0,
				score: 0,
				speed: SPEED_MIN,
				spawn: 60,
				obstacles: [],
				over: false
			};
		}

		// ── audio ─────────────────────────────────────────────────────────────
		// Beeps are synthesised, so the plugin still ships zero assets. Every
		// call is wrapped: an AudioContext that a browser refuses to create, or
		// that is simply unavailable, must never break the game loop.
		function makeAudio() {
			let context = null;
			let enabled = true;

			function ensure() {
				if (context !== null) return context;
				try {
					const Ctor = window.AudioContext || window.webkitAudioContext;
					if (typeof Ctor !== "function") return null;
					context = new Ctor();
				} catch (err) {
					context = null;
				}
				return context;
			}

			function beep(freq, durationMs, type) {
				if (!enabled) return;
				const audio = ensure();
				if (audio === null) return;
				try {
					const osc = audio.createOscillator();
					const gain = audio.createGain();
					osc.type = type;
					osc.frequency.value = freq;
					gain.gain.value = 0.05;
					osc.connect(gain);
					gain.connect(audio.destination);
					const now = audio.currentTime;
					osc.start(now);
					osc.stop(now + durationMs / 1000);
				} catch (err) {
					// A refused or closed context is cosmetic only.
				}
			}

			return {
				jump() {
					beep(560, 90, "square");
				},
				hit() {
					beep(150, 220, "sawtooth");
				},
				get enabled() {
					return enabled;
				},
				set enabled(value) {
					enabled = value === true;
				}
			};
		}

		// ── rendering ─────────────────────────────────────────────────────────
		/** Paint one frame: ground, dino, obstacles. */
		function paint(canvas, state, ground) {
			if (canvas === null) return;
			const g = canvas.getContext("2d");
			if (g === null) return;

			g.clearRect(0, 0, W, H);

			// ground line
			g.strokeStyle = "rgba(128,128,128,.55)";
			g.lineWidth = 1;
			g.beginPath();
			g.moveTo(0, ground + 1);
			g.lineTo(W, ground + 1);
			g.stroke();

			// scrolling ground speckles, so speed reads even with no obstacles
			const offset = state.tick * state.speed;
			g.fillStyle = "rgba(128,128,128,.35)";
			for (let i = 0; i < 14; i += 1) {
				const x = (i * 26 - offset) % (W + 26);
				g.fillRect(x < 0 ? x + W + 26 : x, ground + 5, 4, 1);
			}

			// dino: body, head, eye, legs
			const dinoY = ground - DINO_H - 2 + state.y;
			g.fillStyle = "#5b6472";
			g.fillRect(DINO_X, dinoY, 18, DINO_H);
			g.fillRect(DINO_X + 14, dinoY + 2, 8, 8);
			g.fillStyle = "#ffffff";
			g.fillRect(DINO_X + 18, dinoY + 4, 3, 3);
			g.fillStyle = "#5b6472";
			if (state.onGround) {
				// Alternating legs make the run legible while standing still.
				const lift = Math.floor(state.tick / 4) % 2 === 0;
				g.fillRect(DINO_X + 2, dinoY + DINO_H, 4, lift ? 3 : 5);
				g.fillRect(DINO_X + 11, dinoY + DINO_H, 4, lift ? 5 : 3);
			} else {
				g.fillRect(DINO_X + 2, dinoY + DINO_H, 4, 3);
				g.fillRect(DINO_X + 11, dinoY + DINO_H, 4, 3);
			}

			// obstacles: a cactus body with a small arm
			g.fillStyle = "#8a94a6";
			for (let i = 0; i < state.obstacles.length; i += 1) {
				const o = state.obstacles[i];
				g.fillRect(o.x, ground - o.h, o.w, o.h);
				g.fillRect(o.x + 3, ground - o.h - 5, 3, 5);
				g.fillRect(o.x - 3, ground - o.h + 4, 3, 6);
			}
		}

		// ── game ──────────────────────────────────────────────────────────────
		/** The playable panel. Owns the loop, the input and the score. */
		function Game(props) {
			const canvasRef = react.useRef(null);
			const stateRef = react.useRef(null);
			const bestRef = react.useRef(0);
			const audioRef = react.useRef(null);
			if (audioRef.current === null) audioRef.current = makeAudio();

			const scoreState = react.useState(0);
			const score = scoreState[0];
			const setScore = scoreState[1];
			const overState = react.useState(false);
			const over = overState[0];
			const setOver = overState[1];
			const runState = react.useState(true);
			const running = runState[0];
			const setRunning = runState[1];
			const bestState = react.useState(() => {
				try {
					const value = Number(window.localStorage.getItem(BEST_KEY));
					return Number.isFinite(value) ? value : 0;
				} catch (err) {
					return 0;
				}
			});
			const best = bestState[0];
			const setBest = bestState[1];
			const muteState = react.useState(false);
			const muted = muteState[0];
			const setMuted = muteState[1];

			bestRef.current = best;
			audioRef.current.enabled = !muted;

			function repaint() {
				paint(canvasRef.current, stateRef.current, GROUND);
			}

			function reset() {
				stateRef.current = freshState();
				setScore(0);
				setOver(false);
				setRunning(true);
				paint(canvasRef.current, stateRef.current, GROUND);
			}

			function jump() {
				const state = stateRef.current;
				if (state === null) return;
				if (state.over) {
					reset();
					return;
				}
				if (state.onGround) {
					state.vy = JUMP_V;
					state.onGround = false;
					audioRef.current.jump();
				}
			}

			// Mount: seed the state and keep the refs current for the closure
			// that the loop reads.
			react.useEffect(() => {
				reset();
			}, []);

			// Keyboard: only while the pointer is over the panel or the canvas
			// holds focus, so Space never gets stolen from the composer.
			react.useEffect(() => {
				const canvas = canvasRef.current;
				if (canvas === null) return undefined;
				const doc = canvas.ownerDocument;
				let armed = false;
				const onKey = (event) => {
					if (!armed) return;
					if (event.code === "Space" || event.key === " " || event.key === "ArrowUp") {
						event.preventDefault();
						jump();
					}
				};
				const arm = () => {
					armed = true;
				};
				const disarm = () => {
					armed = false;
				};
				canvas.addEventListener("pointerenter", arm);
				canvas.addEventListener("pointerleave", disarm);
				canvas.addEventListener("focus", arm);
				canvas.addEventListener("blur", disarm);
				doc.addEventListener("keydown", onKey);
				return () => {
					canvas.removeEventListener("pointerenter", arm);
					canvas.removeEventListener("pointerleave", disarm);
					canvas.removeEventListener("focus", arm);
					canvas.removeEventListener("blur", disarm);
					doc.removeEventListener("keydown", onKey);
				};
			}, []);

			// The loop. Paused whenever the pointer is away or the run is over,
			// which is also what keeps it cheap in a background tab.
			react.useEffect(() => {
				if (!running || over) return undefined;
				const id = window.setInterval(() => {
					const state = stateRef.current;
					if (state === null || state.over) return;

					state.tick += 1;
					state.vy += GRAVITY;
					state.y += state.vy;
					if (state.y >= 0) {
						state.y = 0;
						state.vy = 0;
						state.onGround = true;
					}
					state.speed = Math.min(SPEED_MAX, SPEED_MIN + state.tick * 0.0016);

					state.spawn -= state.speed;
					if (state.spawn <= 0) {
						const tall = Math.random() < 0.34;
						state.obstacles.push({
							x: W + 8,
							w: tall ? 14 : 10,
							h: tall ? 30 : 20
						});
						state.spawn = 70 + Math.random() * 70;
					}

					for (let i = state.obstacles.length - 1; i >= 0; i -= 1) {
						const o = state.obstacles[i];
						o.x -= state.speed;
						if (o.x + o.w < -6) state.obstacles.splice(i, 1);
					}

					state.score += 1;

					// Collision: rectangle overlap, remembering that the dino's
					// `y` is an offset upward from the ground line.
					const dinoTop = state.y;
					const dinoBottom = state.y + DINO_H;
					for (let i = 0; i < state.obstacles.length; i += 1) {
						const o = state.obstacles[i];
						const hitsX = DINO_X < o.x + o.w && DINO_X + DINO_W > o.x;
						const hitsY = dinoBottom > -o.h && dinoTop < 0;
						if (hitsX && hitsY) {
							state.over = true;
							window.clearInterval(id);
							audioRef.current.hit();
							const finalScore = Math.floor(state.score / TICKS_PER_POINT);
							setScore(finalScore);
							setOver(true);
							setRunning(false);
							if (finalScore > bestRef.current) {
								bestRef.current = finalScore;
								setBest(finalScore);
								try {
									window.localStorage.setItem(BEST_KEY, String(finalScore));
								} catch (err) {
									// A blocked store only costs the record.
								}
							}
							break;
						}
					}

					if (state.tick % TICKS_PER_POINT === 0) {
						setScore(Math.floor(state.score / TICKS_PER_POINT));
					}
					repaint();
				}, TICK_MS);
				return () => {
					window.clearInterval(id);
				};
			}, [running, over]);

			return react.createElement("div", { className: "dg-root" },
				react.createElement("div", { className: "dg-panel" },
					react.createElement("div", { className: "dg-head" },
						react.createElement("span", null, TEXT.title),
						react.createElement("span", { className: "dg-sp" }),
						react.createElement("span", { className: "dg-score" },
							TEXT.score + " " + score + " · " + TEXT.best + " " + best
						)
					),
					react.createElement("canvas", {
						ref: canvasRef,
						className: "dg-canvas",
						width: W,
						height: H,
						tabIndex: 0,
						title: TEXT.tip,
						onPointerDown: jump,
						onPointerEnter: () => {
							if (!over) setRunning(true);
						},
						onPointerLeave: () => setRunning(false)
					}),
					react.createElement("div", { className: "dg-foot" },
						react.createElement("span", null, over ? "💥 " + TEXT.restart : TEXT.tip),
						react.createElement("span", { className: "dg-sp" }),
						react.createElement("button", {
							type: "button",
							className: "dg-btn",
							title: muted ? TEXT.sound : TEXT.mute,
							onClick: () => setMuted(!muted)
						}, muted ? "🔇" : "🔊"),
						react.createElement("button", {
							type: "button",
							className: "dg-btn dg-primary",
							onClick: over ? reset : jump
						}, over ? TEXT.restart : TEXT.jump),
						react.createElement("button", {
							type: "button",
							className: "dg-btn",
							title: TEXT.hide,
							onClick: props.onHide
						}, "—")
					)
				)
			);
		}

		// ── plugin ────────────────────────────────────────────────────────────
		/** True while the pointer sits over the floating panel. */
		function Layer() {
			const visibleState = react.useState(true);
			const visible = visibleState[0];
			const setVisible = visibleState[1];
			const keyState = react.useState(0);
			const runKey = keyState[0];
			const setRunKey = keyState[1];

			if (!visible) {
				return react.createElement("button", {
					type: "button",
					className: "dg-chip",
					title: TEXT.show,
					onClick: () => {
						setRunKey(runKey + 1);
						setVisible(true);
					}
				}, "🦖");
			}

			return react.createElement(Game, {
				key: "run-" + runKey,
				onHide: () => setVisible(false)
			});
		}

		/** Register the one overlay entry that owns the whole game. */
		function apply(ctx) {
			ctx.effect(() => ctx.styles.insert(CSS));
			ctx.slots.inject("shell.overlay", () => ctx.slots.register({
				name: "shell.overlay",
				id: "dino-game",
				order: 80
			}, Layer));
		}

		exports.apply = apply;
		exports.inject = ["slots", "styles"];
		exports.name = NS;
		return module.exports;
	}
});
