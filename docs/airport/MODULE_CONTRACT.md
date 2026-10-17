# HỢP ĐỒNG GIAO TIẾP MODULE & PHÂN QUYỀN FILE (`MODULE_CONTRACT.md`)

> **Dự án:** English Life World — Airport 2.5D Demo Redesign
> **Vai trò biên soạn:** Agent P1-B (Architecture & Module Contract)
> **Mục đích:** Khóa chặt giao diện API công khai, danh mục sự kiện Event Bus, schema dữ liệu JSON, quy tắc quản lý trạng thái và bảng phân quyền sở hữu file độc quyền giữa **Claude (Lead)** và **4 Agent chuyên trách** trước khi bắt đầu viết code.
> **Nguyên tắc tối thượng:** Không file nào có 2 chủ. Mọi giao tiếp giữa các module khác chủ sở hữu phải đi qua **Public API** hoặc **Event Bus** được định nghĩa trong tài liệu này.

---

## 1. BẢNG PHÂN QUYỀN SỞ HỮU FILE (`FILE OWNERSHIP MATRIX`)

> **QUY TẮC BẮT BUỘC:**
> 1. Mỗi Agent **CHỈ** được tạo và chỉnh sửa các file nằm trong cột `Phạm vi File Sở hữu Độc quyền` của mình.
> 2. **Tuyệt đối không một file nào có 2 chủ.**
> 3. Không một Agent nào được sửa bất kỳ file nào ngoài thư mục `airport-demo/` (nghiêm cấm chạm vào `index.html`, `modules/**` của ứng dụng chính).
> 4. Nếu một Agent cần bổ sung API hoặc trường dữ liệu thuộc file của Agent khác, phải gửi yêu cầu qua **Claude / Lead** để điều phối.

| Chủ sở hữu (Owner) | Vai trò | Phạm vi File Sở hữu Độc quyền (Exclusive Paths) | File Tuyệt đối KHÔNG được sửa |
|---|---|---|---|
| **Claude / Lead Architect** | Điều phối kiến trúc, Entry Point, Hạ tầng Core (`bus`, `loop`, `camera`, `nav`, `input`, `audio`, `state`), Tích hợp & Nghiệm thu | • `airport-demo/index.html`<br>• `airport-demo/core/bus.js`<br>• `airport-demo/core/loop.js`<br>• `airport-demo/core/camera.js`<br>• `airport-demo/core/nav.js`<br>• `airport-demo/core/input.js`<br>• `airport-demo/core/audio.js`<br>• `airport-demo/core/state.js` | Toàn bộ file ứng dụng chính (`../index.html`, `../modules/**`) |
| **Agent 1** (`World / Env`) | World Designer & Environment (Bản đồ 2.5D, 4 khu vực, đồ vật tương tác, Y-sort, asset môi trường) | • `airport-demo/world/**` (`scene.js`, `props.js`, `ysort.js`)<br>• `airport-demo/assets/env/**`<br>• `airport-demo/data/map.json`<br>• `airport-demo/data/objects.json` | `core/**`, `actors/**`, `gameplay/**`, `ui/**`, `data/npcs.json`, `data/lines.json`, `data/quests.json`, `index.html` |
| **Agent 2** (`Character / Pet / Anim`) | Character, Pet, NPC & Animation State Machine | • `airport-demo/actors/**` (`character.js`, `pet.js`, `npc.js`, `anim-fsm.js`)<br>• `airport-demo/assets/actors/**`<br>• `airport-demo/data/npcs.json` | `core/**`, `world/**`, `gameplay/**`, `ui/**`, `data/map.json`, `data/objects.json`, `data/lines.json`, `data/quests.json`, `index.html` |
| **Agent 3** (`Gameplay / Interaction / Learning`) | Interaction System (sửa lỗi lặp hành động), Narration chống trùng, Dialogue, Learning, Quests & Unit Tests | • `airport-demo/gameplay/**` (`interaction.js`, `narration.js`, `dialogue.js`, `learning.js`, `quest.js`)<br>• `airport-demo/assets/audio/**`<br>• `airport-demo/data/lines.json`<br>• `airport-demo/data/quests.json`<br>• `airport-demo/tests/unit/**` | `core/**`, `world/**`, `actors/**`, `ui/**`, `data/map.json`, `data/objects.json`, `data/npcs.json`, `tests/e2e/**`, `index.html` |
| **Agent 4** (`UI / QA`) | Giao diện HUD, Action Popover, Quest Panel, Learning Panel, Story Panel, Responsive & Playwright E2E QA | • `airport-demo/ui/**` (`styles.css`, `ui-manager.js`, `hud.js`, `action-popover.js`, `quest-panel.js`, `learning-panel.js`, `story-panel.js`)<br>• `airport-demo/tests/e2e/**` | `core/**`, `world/**`, `actors/**`, `gameplay/**`, `data/**`, `tests/unit/**`, `index.html` |

---

## 2. HỢP ĐỒNG API CÔNG KHAI TỪNG MODULE (`PUBLIC MODULE APIS`)

Tất cả các module sử dụng chuẩn **ES Modules (`export` / `import`)** và được Claude gắn kết tại `airport-demo/index.html` đồng thời expose vào `window.ELW_AIRPORT` để phục vụ kiểm thử tự động.

### 2.1. Nhóm Core (`airport-demo/core/**` — Chủ sở hữu: Claude/Lead)

#### A. `core/bus.js` — `EventBus`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `on(eventName, handler)` | `eventName: string`, `handler: (payload: any) => void` | `() => void` (Hàm `unsubscribe`) | Đăng ký lắng nghe sự kiện. Trả về hàm hủy đăng ký để tránh rò rỉ hoặc nhân đôi listener. |
| `once(eventName, handler)` | `eventName: string`, `handler: (payload: any) => void` | `() => void` | Lắng nghe sự kiện đúng 1 lần rồi tự gỡ. |
| `off(eventName, handler)` | `eventName: string`, `handler: Function` | `void` | Gỡ bỏ `handler` khỏi `eventName`. |
| `emit(eventName, payload)` | `eventName: string`, `payload?: object` | `void` | Phát sự kiện đồng bộ tới mọi listener đang đăng ký (bọc từng listener trong `try/catch` để lỗi ở UI không làm gãy luồng Gameplay). |
| `clearAll()` | Không có | `void` | Xóa sạch mọi listener (chỉ dùng trong teardown của Unit Test). |

#### B. `core/loop.js` — `GameLoop`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `registerPhase(name, order, callbacks)` | `name: string`, `order: number`, `callbacks: { update?: (dt: number) => void, render?: (ctx: CanvasRenderingContext2D) => void }` | `void` | Đăng ký hệ thống vào vòng lặp theo thứ tự `order` (`10: input`, `20: actors`, `30: world`, `40: camera`, `50: render`). `dt` tính bằng giây (kẹp trần `Math.min(rawDt, 0.05)` để chống nhảy xuyên tường khi tab ẩn). |
| `start()` | Không có | `void` | Bắt đầu vòng lặp `requestAnimationFrame`. |
| `stop()` | Không có | `void` | Tạm dừng vòng lặp. |
| `stepForTest(dtSeconds)` | `dtSeconds: number` | `void` | Tiến vòng lặp thủ công 1 bước `dtSeconds` (phục vụ Unit Test và Playwright E2E deterministic). |

#### C. `core/camera.js` — `Camera`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `init(options)` | `{ worldW: number, worldH: number, viewportW: number, viewportH: number, dpr: number, damping?: number }` | `void` | Khởi tạo thông số camera (`worldW=3200, worldH=1792, damping=6.5`). |
| `setFollowTarget(getTargetPosFn)` | `getTargetPosFn: () => { x: number, y: number }` | `void` | Gắn hàm lấy tọa độ mục tiêu (nhân vật chính) để camera bám theo mượt mà. |
| `panToFocus(wx, wy, durationMs)` | `wx: number, wy: number, durationMs?: number` | `Promise<void>` | Tạm dịch camera tới điểm quan sát `(wx, wy)` rồi trả lại quyền follow. |
| `setZoom(zoomLevel)` | `zoomLevel: number` | `void` | Đặt độ phóng đại (kẹp trong khoảng `[0.65, 1.30]`). |
| `worldToScreen(wx, wy)` | `wx: number, wy: number` | `{ x: number, y: number }` | Chuyển tọa độ thế giới sang tọa độ CSS pixel trên vùng nhìn (dùng để đặt `ActionPopover`). |
| `screenToWorld(sx, sy)` | `sx: number, sy: number` | `{ x: number, y: number }` | Chuyển tọa độ CSS pixel (sau khi trừ `canvas.getBoundingClientRect()`) sang tọa độ thế giới. |
| `getVisibleWorldBounds(marginPx)` | `marginPx?: number` (mặc định `128`) | `{ minX: number, minY: number, maxX: number, maxY: number }` | Lấy hình chữ nhật vùng nhìn hiện tại trong tọa độ thế giới để `world/scene.js` thực hiện Frustum Culling. |
| `resize(viewportW, viewportH, dpr)` | `viewportW: number, viewportH: number, dpr: number` | `void` | Cập nhật kích thước khung nhìn và tỷ lệ điểm ảnh khi cửa sổ thay đổi. |
| `update(dt)` | `dt: number` | `void` | Cập nhật vị trí camera với exponential damping và clamp biên bản đồ. |
| `applyTransform(ctx)` | `ctx: CanvasRenderingContext2D` | `void` | Áp dụng ma trận `ctx.setTransform(...)` cho Canvas ở đầu mỗi lượt vẽ. |

#### D. `core/nav.js` — `NavigationGrid`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `loadFromMap(mapJson, objectsJson)` | `mapJson: MapSchema`, `objectsJson: ObjectSchema[]` | `void` | Dựng lưới `100 × 56` (`tileSize = 32px`), đánh dấu các ô `WALKABLE (0)`, `BLOCKED_STATIC (1)`, `BLOCKED_PROP (2)`, `BLOCKED_DYNAMIC (3)`. |
| `worldToTile(wx, wy)` | `wx: number, wy: number` | `{ col: number, row: number }` | Đổi tọa độ pixel thế giới sang chỉ số cột/hàng. |
| `tileToWorld(col, row)` | `col: number, row: number` | `{ x: number, y: number }` | Đổi chỉ số cột/hàng sang tọa độ tâm ô lưới (`col * 32 + 16, row * 32 + 16`). |
| `isWalkableTile(col, row)` | `col: number, row: number` | `boolean` | Kiểm tra ô `(col, row)` có nằm trong biên và bằng `0` (`WALKABLE`) hay không. |
| ` isWalkableWorld(wx, wy)` | `wx: number, wy: number` | `boolean` | Kiểm tra điểm `(wx, wy)` có đi được không. |
| `findNearestWalkable(wx, wy, maxRadiusTiles)` | `wx: number, wy: number, maxRadiusTiles?: number` (mặc định `5`) | `{ x: number, y: number, col: number, row: number } \| null` | Tìm điểm đi được gần nhất khi người chơi click trúng vùng bị chặn. |
| `findPath(startWx, startWy, goalWx, goalWy, opts)` | `startWx: number, startWy: number, goalWx: number, goalWy: number, opts?: { smooth?: boolean, agentRadius?: number }` | `{ ok: boolean, waypoints: Array<{x: number, y: number}>, targetAdjusted: boolean, reason?: string }` | Chạy A* 8 hướng (chống cắt góc) + làm mượt đường đi (`smoothPath`). Trả về danh sách waypoint từ vị trí tiếp theo đến đích. |
| `smoothPath(rawWaypoints, agentRadiusPx)` | `rawWaypoints: Array<{x: number, y: number}>, agentRadiusPx?: number` | `Array<{x: number, y: number}>` | Loại bỏ các nút trung gian thừa bằng thuật toán String Pulling raycast. |
| `setDynamicObstacle(gateId, blocked)` | `gateId: string, blocked: boolean` | `void` | Khóa hoặc mở khóa vùng ô của cổng động (ví dụ `boarding_scanner_gate`). |

#### E. `core/audio.js` — `AudioManager`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `init(linesJson, settings)` | `linesJson: Record<string, LineSchema>`, `settings?: { muted?: boolean, rate?: number }` | `void` | Khởi tạo bộ quản lý âm thanh và nạp danh mục câu thoại. |
| `speakLine(lineId, options)` | `lineId: string`, `options?: { rate?: number, onStart?: () => void }` | `Promise<{ ok: boolean, mode: "mp3" \| "tts" \| "muted" \| "error", lineId: string }>` | Phát file MP3 Giọng C của `lineId`; nếu thiếu hoặc lỗi thì tự động fallback sang `speechSynthesis`. **Luôn resolve an toàn trong `≤ 4500ms`, không bao giờ treo.** |
| `stopSpeech()` | Không có | `void` | Dừng ngay lập tức file MP3 thoại hoặc câu TTS đang phát. |
| `playSfx(sfxId)` | `sfxId: "click" \| "footstep" \| "zip_open" \| "zip_close" \| "scanner_beep" \| "gate_open" \| "quest_done" \| "invalid"` | `void` | Phát hiệu ứng âm thanh ngắn (Web Audio API synth nhẹ hoặc file SFX). |
| `setMuted(muted)` | `muted: boolean` | `void` | Bật/tắt toàn bộ âm thanh và phát sự kiện cập nhật HUD. |
| `isMuted()` | Không có | `boolean` | Trả về trạng thái tắt tiếng hiện tại. |

#### F. `core/state.js` — `SaveManager`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `loadAll()` | Không có | `{ worldSave: object \| null, storySave: object \| null, settings: object }` | Đọc dữ liệu từ 3 khóa `elw_airport_save_v1`, `elw_airport_story_v1`, `elw_airport_settings_v1`. |
| `saveWorld(worldSnapshot)` | `worldSnapshot: object` | `void` | Lưu trạng thái thế giới, vị trí nhân vật và nhiệm vụ vào `elw_airport_save_v1`. |
| `saveStory(storySnapshot)` | `storySnapshot: object` | `void` | Lưu `recordedActionIds` và `entries` vào `elw_airport_story_v1`. |
| `saveSettings(settings)` | `settings: object` | `void` | Lưu cấu hình âm thanh/phụ đề vào `elw_airport_settings_v1`. |
| `clearAll()` | Không có | `void` | Xóa sạch cả 3 khóa `elw_airport_*` khỏi `localStorage`. |

---

### 2.2. Nhóm World & Environment (`airport-demo/world/**` — Chủ sở hữu: Agent 1)

| Tên hàm (`world/scene.js` & `world/props.js`) | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initWorld(mapJson, objectsJson, bus)` | `mapJson: MapSchema`, `objectsJson: ObjectSchema[]`, `bus: EventBus` | `Promise<void>` | Khởi tạo 4 khu vực sân bay, pre-render nền sàn vào offscreen chunks, đăng ký toàn bộ đồ vật tương tác. |
| `getZoneAt(wx, wy)` | `wx: number, wy: number` | `ZoneSchema \| null` | Trả về khu vực hiện tại chứa điểm `(wx, wy)` (vd: `zone_checkin`, `zone_security`, `zone_lounge`, `zone_boarding`). |
| `getObjectById(objectId)` | `objectId: string` | `ObjectInstance \| null` | Lấy thông tin cấu hình và trạng thái visual hiện tại của một đồ vật. |
| `getAllObjects()` | Không có | `ObjectInstance[]` | Lấy danh sách toàn bộ đồ vật tương tác trên bản đồ. |
| `setObjectVisualState(objectId, nextState, opts)` | `objectId: string, nextState: string, opts?: { animate?: boolean }` | `Promise<void>` | Cập nhật trạng thái hiển thị của đồ vật (vd: `player_suitcase` chuyển từ `"closed"` sang `"open"`, chạy hiệu ứng bung nắp vali). |
| `hitTestWorld(wx, wy)` | `wx: number, wy: number` | `{ type: "object" \| "npc", id: string, entity: object } \| null` | Kiểm tra tọa độ `(wx, wy)` có chạm vào vùng chọn (`hitBox`) của đồ vật hoặc NPC nào không (ưu tiên vật có `footY` lớn hơn). |
| `getApproachPoint(targetId, fromWx, fromWy)` | `targetId: string, fromWx: number, fromWy: number` | `{ x: number, y: number, facing: Direction }` | Trả về điểm tiếp cận hợp lệ gần `(fromWx, fromWy)` nhất của đồ vật hoặc NPC. |
| `showClickMarker(wx, wy, kind)` | `wx: number, wy: number, kind?: "move" \| "interact" \| "blocked"` | `void` | Hiển thị vòng tròn phản hồi tại điểm vừa click trên mặt sàn. |
| `update(dt, playerPos)` | `dt: number, playerPos: { x: number, y: number }` | `void` | Cập nhật hoạt ảnh môi trường (bảng điện tử nhấp nháy, băng chuyền chạy, cửa trượt tự động mở khi nhân vật lại gần) và phát `zone:changed` nếu nhân vật bước sang khu mới. |
| `renderWorld(ctx, camera, externalRenderables)` | `ctx: CanvasRenderingContext2D, camera: Camera, externalRenderables: RenderableItem[]` | `void` | Vẽ Layer 0 (Floor), Layer 1 (Shadows & ClickMarker), gộp đồ vật với `externalRenderables` (Player, Pet, NPCs) qua `ysort.js` để vẽ Layer 2, sau đó vẽ Layer 3 (Overhead) và Layer 4 (World Overlays). |

---

### 2.3. Nhóm Character, Pet, NPC & Animation (`airport-demo/actors/**` — Chủ sở hữu: Agent 2)

#### A. `actors/character.js` — `CharacterController`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initCharacter(config, bus, nav)` | `config: { spawnX: number, spawnY: number, facing?: Direction }`, `bus: EventBus`, `nav: NavigationGrid` | `void` | Khởi tạo nhân vật chính và `CharacterFSM`. |
| `spawn(wx, wy, facing)` | `wx: number, wy: number, facing?: Direction` | `void` | Đặt nhân vật ngay lập tức tại `(wx, wy)`, xóa đường đi cũ và chuyển về `idle`. |
| `moveTo(goalWx, goalWy, options)` | `goalWx: number, goalWy: number, options?: { preferRun?: boolean, onArrive?: () => void, onCancel?: (reason: string) => void }` | `{ token: number, accepted: boolean }` | Tìm đường qua `nav.findPath` và di chuyển nhân vật theo chuỗi waypoint. Nếu đang ngồi (`sit_idle`), tự động chạy `stand_up` trước khi bước đi. Nếu gọi `moveTo` mới khi đang đi, hủy ngay `token` cũ và chuyển hướng mượt. |
| `cancelMove(reason)` | `reason?: string` | `void` | Dừng di chuyển ngay tại vị trí hiện tại, gọi `onCancel` của lệnh đang chạy và đưa FSM về `idle`. |
| `faceTowards(targetWx, targetWy)` | `targetWx: number, targetWy: number` | `void` | Xoay hướng mặt nhân vật nhìn về phía `(targetWx, targetWy)`. |
| `setFacing(direction)` | `direction: "up" \| "down" \| "left" \| "right"` | `void` | Đặt hướng mặt trực tiếp. |
| `playActionAnim(animName, options)` | `animName: "interact" \| "pick_up" \| "put_down" \| "sit" \| "stand" \| "wave"`, `options?: { durationMs?: number, targetId?: string }` | `Promise<{ completed: boolean, cancelled: boolean }>` | Chạy animation hành động từ `frameIndex = 0`. Trả về Promise hoàn tất khi hết thời lượng hoặc khi bị hủy an toàn. |
| `setCarryState(carryType, itemId)` | `carryType: "none" \| "holding_passport" \| "carrying_tray" \| "pulling_suitcase"`, `itemId?: string \| null` | `void` | Cập nhật lớp phụ kiện tay cầm / vali kéo theo sau nhân vật. |
| `getPosition()` | Không có | `{ x: number, y: number, footY: number, facing: Direction }` | Lấy tọa độ chân hiện tại của nhân vật. |
| `getState()` | Không có | `{ baseState: string, carryState: string, carriedItemId: string \| null, isMoving: boolean, moveToken: number }` | Lấy trạng thái toàn diện của nhân vật. |
| `getRenderable()` | Không có | `RenderableItem` | Trả về đối tượng `{ id: "player", footY, zBias: 1, render(ctx) }` để đưa vào bộ Y-Sort ở Layer 2. |
| `update(dt)` | `dt: number` | `void` | Cập nhật dịch chuyển dọc theo waypoint và cập nhật `CharacterFSM`. |

#### B. `actors/pet.js` — `PetController`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initPet(config, bus, characterController)` | `config: { spawnX: number, spawnY: number }`, `bus: EventBus`, `characterController: CharacterController` | `void` | Khởi tạo thú cưng đồng hành tại sân bay. |
| `playReaction(kind)` | `kind: "happy" \| "curious" \| "sleepy" \| "bark"` | `void` | Phát biểu cảm/hành động ngắn trên đầu và thân thú cưng khi nhân vật hoàn thành tương tác. |
| `getPosition()` | Không có | `{ x: number, y: number, footY: number }` | Lấy vị trí hiện tại của thú cưng (giữ khoảng cách `48–72px` sau nhân vật). |
| `getRenderable()` | Không có | `RenderableItem` | Trả về đối tượng vẽ Layer 2 (không chặn hit-test đồ vật). |
| `update(dt)` | `dt: number` | `void` | Cập nhật AI đi theo vết chân nhân vật và animation của thú cưng. |

#### C. `actors/npc.js` — `NpcManager`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initNpcs(npcsJson, bus)` | `npcsJson: NpcSchema[]`, `bus: EventBus` | `void` | Khởi tạo 5 NPC sân bay (`checkin_agent`, `airport_staff`, `security_officer`, `passenger_linh`, `gate_attendant`). |
| `getNpcById(npcId)` | `npcId: string` | `NpcInstance \| null` | Lấy thực thể NPC theo ID. |
| `getAllNpcs()` | Không có | `NpcInstance[]` | Lấy danh sách toàn bộ NPC. |
| `faceTowards(npcId, wx, wy)` | `npcId: string, wx: number, wy: number` | `void` | Cho NPC xoay hướng nhìn về phía nhân vật khi giao tiếp. |
| `playNpcAnim(npcId, animName, durationMs)` | `npcId: string, animName: "idle" \| "talk" \| "wave" \| "stamp_ticket" \| "check_passport", durationMs?: number` | `Promise<void>` | Chạy hoạt ảnh phản ứng của NPC. |
| `getRenderables()` | Không có | `RenderableItem[]` | Trả về danh sách các `RenderableItem` của mọi NPC cho bộ Y-Sort. |
| `update(dt, playerPos)` | `dt: number, playerPos: { x: number, y: number }` | `void` | Cập nhật idle animation và hướng nhìn tự nhiên của NPC. |

---

### 2.4. Nhóm Gameplay, Interaction, Narration & Learning (`airport-demo/gameplay/**` — Chủ sở hữu: Agent 3)

#### A. `gameplay/interaction.js` — `InteractionSystem`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initInteraction(deps)` | `{ bus, world, character, npcManager, audio, narration, dialogue, quest, saveManager, objectsJson, linesJson }` | `void` | Khởi tạo hệ thống tương tác với 3 luồng độc lập (`currentState`, `actionExecution`, `narrationHistory`). |
| `selectTarget(targetType, targetId)` | `targetType: "object" \| "npc"`, `targetId: string` | `{ target: object, actions: ActionViewModel[] } \| null` | Đánh dấu đối tượng đang chọn và tính danh sách hành động kèm trạng thái khả dụng theo `currentState` thực tại. Phát `interaction:target-selected`. |
| `getAvailableActions(targetId)` | `targetId: string` | `ActionViewModel[]` | Trả về danh sách các hành động của `targetId`, trong đó mỗi phần tử có `{ id, labelEn, labelVi, lineId, enabled: boolean, blockedReasonVi: string \| null, blockedReasonEn: string \| null, practiceCount: number }`. |
| `canExecuteAction(actionId, stateOverride)` | `actionId: string, stateOverride?: WorldState` | `{ ok: boolean, reasonVi: string \| null, reasonEn: string \| null }` | **Chỉ kiểm tra dựa trên `currentState`**, tuyệt đối không kiểm tra lịch sử đã làm để chặn. |
| `requestAction(actionId, options)` | `actionId: string, options?: { skipMoveIfClose?: boolean }` | `Promise<{ status: "completed" \| "blocked" \| "cancelled" \| "debounced", runId?: string, reasonVi?: string }>` | Thực thi hành động: kiểm tra debounce (`<250ms` nếu cùng action đang chạy) → kiểm tra `canExecuteAction` → di chuyển nhân vật tới `approachPoint` → chạy đồng thời Luồng A (Animation + đổi `currentState`), Luồng B (`AudioManager.speakLine`), rồi khi hoàn tất gọi Luồng C (`NarrationManager.recordCompletedAction`). |
| `cancelActiveAction(reason)` | `reason?: string` | `void` | Hủy lượt thực thi đang ở bước `approaching` hoặc `animating`, mở khóa trạng thái bận ngay lập tức. |
| `getWorldState()` | Không có | `WorldState` | Trả về bản sao bất biến của `currentState` hiện tại. |
| `resetWorldState()` | Không có | `void` | Đưa toàn bộ trạng thái đồ vật, túi đồ và hành động đang chạy về mặc định ban đầu. |

#### B. `gameplay/narration.js` — `NarrationManager` ("Phần đoạn văn của tôi")
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initNarration(linesJson, savedStory, bus)` | `linesJson: Record<string, LineSchema>`, `savedStory: object \| null`, `bus: EventBus` | `void` | Khởi tạo bộ lưu đoạn văn với `recordedActionIds = new Set()`. |
| `recordCompletedAction(actionId)` | `actionId: string` | `{ addedNewSentence: boolean, entry: StoryEntry, totalUniqueSentences: number }` | Nếu `recordedActionIds.has(actionId)` là `false`: thêm vào `Set`, đẩy câu mới vào `entries` và phát `narration:entry-added`. Nếu là `true` (lặp lại hành động): **chỉ tăng `practiceCount++`**, không thêm câu trùng lặp, phát `narration:practice-incremented`. |
| `hasRecorded(actionId)` | `actionId: string` | `boolean` | Kiểm tra một hành động đã có mặt trong đoạn văn hay chưa. |
| `getPracticeCount(actionId)` | `actionId: string` | `number` | Trả về tổng số lần người chơi đã thực hiện thành công `actionId` trong phiên. |
| `getStoryEntries()` | Không có | `StoryEntry[]` | Trả về danh sách các câu duy nhất theo thứ tự lần đầu thực hiện. |
| `buildParagraphText(options)` | `options?: { includeConnectors?: boolean, lang?: "en" \| "vi" }` | `string` | Kết xuất đoạn văn hoàn chỉnh (ví dụ: *"First, I checked the departure board. Next, I opened my suitcase and took out my passport..."*). Cam kết **0% câu bị lặp lại**. |
| `resetStory()` | Không có | `void` | Xóa sạch `recordedActionIds` và `entries`. |

#### C. `gameplay/dialogue.js` & `gameplay/learning.js` — `DialogueAndLearning`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `replayLineAudio(lineId, slowMode)` | `lineId: string, slowMode?: boolean` | `Promise<void>` | Chỉ phát lại âm thanh câu mẫu (`rate = 0.72` nếu `slowMode === true`) và hiện bong bóng thoại, **không kích hoạt `requestAction` và không ghi vào `NarrationManager`**. |
| `getLineDetails(lineId)` | `lineId: string` | `LineSchema \| null` | Lấy đầy đủ câu tiếng Anh, nghĩa tiếng Việt, phiên âm, từ vựng và mẹo ngữ cảnh để hiển thị trên `LearningPanel`. |
| `evaluateSpeakingAttempt(lineId, spokenText)` | `lineId: string, spokenText: string` | `{ score: number, passed: boolean, matchedWords: string[], feedbackVi: string }` | So khớp văn bản nhận diện giọng nói (hoặc câu người chơi chọn) với câu mẫu, trả về điểm `0..100` và lời khen/gợi ý. |

#### D. `gameplay/quest.js` — `QuestManager`
| Tên hàm | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initQuests(questsJson, savedQuests, bus)` | `questsJson: QuestSchema[]`, `savedQuests: object \| null`, `bus: EventBus` | `void` | Nạp danh sách nhiệm vụ và lắng nghe `action:completed` + `zone:changed`. |
| `getActiveQuest()` | Không có | `QuestViewModel \| null` | Lấy nhiệm vụ hiện tại cùng trạng thái từng bước (`steps`). |
| `getAllQuests()` | Không có | `QuestViewModel[]` | Lấy toàn bộ 4 nhiệm vụ của demo. |
| `evaluateProgress(actionId, worldState)` | `actionId: string, worldState: WorldState` | `{ stepCompleted: string \| null, questCompleted: string \| null }` | Kiểm tra điều kiện hoàn thành bước nhiệm vụ dựa trên hành động thực sự hoàn tất và `worldState`. |
| `resetQuests()` | Không có | `void` | Đưa tiến độ nhiệm vụ về Quest 1, Bước 1. |

---

### 2.5. Nhóm UI Manager (`airport-demo/ui/**` — Chủ sở hữu: Agent 4)

| Tên hàm (`ui/ui-manager.js`) | Tham số | Kiểu trả về | Mô tả hành vi |
|---|---|---|---|
| `initUI(rootElement, bus, controllers)` | `rootElement: HTMLElement`, `bus: EventBus`, `controllers: { camera, interaction, narration, learning, quest, audio, resetDemo }` | `void` | Khởi tạo HUD, Action Popover, Quest Panel, Learning Panel, Story Panel và gắn sự kiện theo nguyên tắc event delegation (chỉ gắn 1 lần duy nhất). |
| `openActionPopover(target, actions)` | `target: object, actions: ActionViewModel[]` | `void` | Hiển thị menu hành động cạnh đồ vật/NPC (trên Desktop) hoặc Bottom Sheet gọn (trên Mobile), tự động tránh đè lên nhân vật chính. |
| `closeActionPopover()` | Không có | `void` | Đóng menu chọn hành động. **Không thay đổi bất kỳ biến trạng thái nào trong `worldState`.** |
| `openLearningPanel(lineId)` | `lineId: string` | `void` | Mở bảng chi tiết học câu mẫu, từ vựng, nút nghe chuẩn / nghe chậm và luyện nói. |
| `openStoryPanel()` | Không có | `void` | Mở bảng *"Phần đoạn văn của tôi (My Airport Story)"* hiển thị đoạn văn tiếng Anh không trùng lặp và số lần thực hành từng câu. |
| `showWorldSpeechBubble(actorId, textEn, textVi, durationMs)` | `actorId: string, textEn: string, textVi?: string, durationMs?: number` | `void` | Hiển thị bong bóng thoại phía trên đầu nhân vật hoặc NPC. |
| `showToast(message, kind)` | `message: string, kind?: "info" \| "success" \| "warning"` | `void` | Hiển thị thông báo ngắn (ví dụ lý do vì sao hành động chưa thực hiện được). |
| `refreshAllPanels()` | Không có | `void` | Đồng bộ lại giao diện với trạng thái mới nhất từ `InteractionSystem`, `QuestManager` và `NarrationManager`. |

---

## 3. DANH SÁCH SỰ KIỆN TRÊN EVENT BUS (`EVENT CATALOG`)

Mọi sự kiện phát qua `bus.emit(eventName, payload)` phải tuân thủ đúng tên và cấu trúc `payload` dưới đây:

| Tên Event (`eventName`) | Module Phát (Publisher) | Module Nghe (Subscribers) | Cấu trúc Payload (`payload`) |
|---|---|---|---|
| `input:ground-click` | `core/input.js` | `core/index`, `world/scene.js`, `ui/ui-manager.js` | `{ wx: number, wy: number, sx: number, sy: number, doubleClick: boolean }` |
| `input:entity-click` | `core/input.js` | `gameplay/interaction.js`, `world/scene.js` | `{ targetType: "object" \| "npc", targetId: string, wx: number, wy: number }` |
| `nav:path-started` | `actors/character.js` | `world/scene.js`, `ui/ui-manager.js` | `{ token: number, from: {x, y}, to: {x, y}, waypoints: Array<{x, y}> }` |
| `nav:arrived` | `actors/character.js` | `gameplay/interaction.js`, `world/scene.js` | `{ token: number, x: number, y: number }` |
| `nav:unreachable` | `core/nav.js` / `actors/character.js` | `ui/ui-manager.js`, `core/audio.js` | `{ requestedX: number, requestedY: number, reasonVi: string, reasonEn: string }` |
| `zone:changed` | `world/scene.js` | `gameplay/quest.js`, `ui/hud.js`, `core/state.js` | `{ prevZoneId: string \| null, zoneId: string, titleEn: string, titleVi: string }` |
| `interaction:target-selected` | `gameplay/interaction.js` | `ui/action-popover.js`, `world/props.js` | `{ targetType: "object" \| "npc", targetId: string, labelEn: string, labelVi: string, worldPos: {x, y}, actions: ActionViewModel[] }` |
| `interaction:popover-closed` | `ui/action-popover.js` | `world/props.js` | `{ reason: "user_close" \| "ground_click" \| "action_started" }` |
| `action:started` | `gameplay/interaction.js` | `ui/ui-manager.js`, `actors/pet.js` | `{ runId: string, actionId: string, targetId: string, lineId: string }` |
| `action:blocked` | `gameplay/interaction.js` | `ui/ui-manager.js`, `core/audio.js` | `{ actionId: string, targetId: string, reasonVi: string, reasonEn: string }` |
| `action:state-applied` | `gameplay/interaction.js` | `world/props.js`, `core/nav.js`, `ui/ui-manager.js` | `{ runId: string, actionId: string, targetId: string, prevState: object, nextState: object }` |
| `action:completed` | `gameplay/interaction.js` | `gameplay/narration.js`, `gameplay/quest.js`, `ui/ui-manager.js`, `actors/pet.js`, `core/state.js` | `{ runId: string, actionId: string, targetId: string, lineId: string, worldState: WorldState }` |
| `action:cancelled` | `gameplay/interaction.js` | `ui/ui-manager.js`, `world/props.js` | `{ runId: string, actionId: string, reason: string }` |
| `audio:speak-started` | `core/audio.js` | `ui/ui-manager.js`, `actors/character.js` | `{ lineId: string, textEn: string, textVi: string, actorId: string, mode: "mp3" \| "tts" }` |
| `audio:speak-completed` | `core/audio.js` | `ui/ui-manager.js`, `actors/character.js` | `{ lineId: string, mode: "mp3" \| "tts" \| "muted" \| "error" }` |
| `narration:entry-added` | `gameplay/narration.js` | `ui/story-panel.js`, `ui/hud.js`, `core/state.js` | `{ actionId: string, lineId: string, sentenceEn: string, paragraphEn: string, totalCount: number }` |
| `narration:practice-incremented` | `gameplay/narration.js` | `ui/story-panel.js`, `ui/action-popover.js`, `core/state.js` | `{ actionId: string, practiceCount: number, paragraphEn: string }` |
| `quest:step-completed` | `gameplay/quest.js` | `ui/quest-panel.js`, `ui/hud.js`, `core/audio.js` | `{ questId: string, stepId: string, stepTitleEn: string, stepTitleVi: string }` |
| `quest:completed` | `gameplay/quest.js` | `ui/quest-panel.js`, `ui/hud.js`, `actors/pet.js`, `core/audio.js` | `{ questId: string, nextQuestId: string \| null, rewardXp: number }` |
| `demo:reset` | `core/state.js` / `index.html` | Toàn bộ module | `{ timestamp: number }` |

---

## 4. SCHEMA DỮ LIỆU JSON CHUẨN (`DATA SCHEMAS`)

### 4.1. `airport-demo/data/map.json` (Chủ sở hữu: Agent 1)

```json
{
  "version": 1,
  "worldWidth": 3200,
  "worldHeight": 1792,
  "tileSize": 32,
  "cols": 100,
  "rows": 56,
  "spawn": {
    "player": { "x": 544, "y": 1440, "facing": "up" },
    "pet": { "x": 496, "y": 1472 }
  },
  "zones": [
    {
      "id": "zone_checkin",
      "titleEn": "Check-in Hall",
      "titleVi": "Sảnh Làm Thủ Tục",
      "bounds": { "x": 64, "y": 224, "w": 1024, "h": 1472 },
      "floorTheme": "warm_terrazzo"
    },
    {
      "id": "corridor_west",
      "titleEn": "Security Concourse",
      "titleVi": "Hành Lang An Ninh",
      "bounds": { "x": 1088, "y": 640, "w": 224, "h": 448 },
      "floorTheme": "guide_tile"
    },
    {
      "id": "zone_security",
      "titleEn": "Security Check",
      "titleVi": "Khu Kiểm Tra An Ninh",
      "bounds": { "x": 1312, "y": 352, "w": 672, "h": 1024 },
      "floorTheme": "cool_slate"
    },
    {
      "id": "corridor_east",
      "titleEn": "Airside Walkway",
      "titleVi": "Lối Vào Khu Cách Ly",
      "bounds": { "x": 1984, "y": 640, "w": 192, "h": 448 },
      "floorTheme": "guide_tile"
    },
    {
      "id": "zone_lounge",
      "titleEn": "Waiting Lounge",
      "titleVi": "Phòng Chờ Chuyến Bay",
      "bounds": { "x": 2176, "y": 896, "w": 928, "h": 800 },
      "floorTheme": "lounge_carpet"
    },
    {
      "id": "zone_boarding",
      "titleEn": "Boarding Gate 12",
      "titleVi": "Cửa Lên Máy Bay Số 12",
      "bounds": { "x": 2176, "y": 160, "w": 928, "h": 736 },
      "floorTheme": "gate_terrazzo"
    }
  ],
  "staticBlockedRects": [
    { "id": "wall_north_checkin", "x": 0, "y": 0, "w": 1088, "h": 224 },
    { "id": "wall_corridor_top_1", "x": 1088, "y": 0, "w": 224, "h": 640 },
    { "id": "wall_corridor_bot_1", "x": 1088, "y": 1088, "w": 224, "h": 704 }
  ],
  "dynamicGates": [
    {
      "id": "boarding_scanner_gate",
      "tileRect": { "col": 86, "row": 14, "w": 2, "h": 2 },
      "defaultBlocked": true
    }
  ]
}
```

### 4.2. `airport-demo/data/objects.json` (Chủ sở hữu: Agent 1)

Mỗi đồ vật khai báo rõ `states`, `defaultState`, `footprint` (vùng chặn đi lại), `hitBox` (vùng click), `approachPoints` và danh sách `actions` (tham chiếu tới `actionId` và `lineId`):

```json
[
  {
    "id": "player_suitcase",
    "zoneId": "zone_checkin",
    "labelEn": "Travel Suitcase",
    "labelVi": "Vali hành lý",
    "x": 480,
    "y": 1120,
    "footY": 1136,
    "footprint": { "x": 456, "y": 1096, "w": 48, "h": 40, "blocksNav": true },
    "hitBox": { "x": 444, "y": 1048, "w": 72, "h": 96 },
    "approachPoints": [
      { "id": "south", "x": 480, "y": 1168, "facing": "up" },
      { "id": "east", "x": 536, "y": 1120, "facing": "left" }
    ],
    "defaultState": "closed",
    "states": ["closed", "open"],
    "actions": [
      {
        "id": "open_suitcase",
        "labelEn": "Open the suitcase",
        "labelVi": "Mở vali",
        "lineId": "line_open_suitcase",
        "charAnim": "interact",
        "objTargetState": "open",
        "requiresObjectState": "closed",
        "blockedReasonVi": "Vali đang mở rồi.",
        "blockedReasonEn": "The suitcase is already open.",
        "recordInStory": true
      },
      {
        "id": "take_passport",
        "labelEn": "Take out my passport",
        "labelVi": "Lấy hộ chiếu ra",
        "lineId": "line_take_passport",
        "charAnim": "pick_up",
        "requiresObjectState": "open",
        "requiresMissingInventory": "passport",
        "grantsInventory": "passport",
        "setsCarryState": "holding_passport",
        "blockedReasonVi": "Cần mở vali trước (hoặc bạn đã cầm hộ chiếu rồi).",
        "blockedReasonEn": "Open the suitcase first (or you already have your passport).",
        "recordInStory": true
      },
      {
        "id": "close_suitcase",
        "labelEn": "Close the suitcase",
        "labelVi": "Đóng vali lại",
        "lineId": "line_close_suitcase",
        "charAnim": "interact",
        "objTargetState": "closed",
        "requiresObjectState": "open",
        "blockedReasonVi": "Vali đang đóng rồi.",
        "blockedReasonEn": "The suitcase is already closed.",
        "recordInStory": true
      }
    ]
  },
  {
    "id": "checkin_counter",
    "zoneId": "zone_checkin",
    "labelEn": "Check-in Counter",
    "labelVi": "Quầy làm thủ tục",
    "x": 352,
    "y": 544,
    "footY": 576,
    "footprint": { "x": 256, "y": 480, "w": 192, "h": 96, "blocksNav": true },
    "hitBox": { "x": 256, "y": 420, "w": 192, "h": 160 },
    "approachPoints": [
      { "id": "front", "x": 352, "y": 624, "facing": "up" }
    ],
    "defaultState": "ready",
    "states": ["ready", "checked_in"],
    "linkedNpcId": "npc_checkin_agent",
    "actions": [
      {
        "id": "greet_checkin_agent",
        "labelEn": "Say hello & ask to check in",
        "labelVi": "Chào nhân viên & xin làm thủ tục",
        "lineId": "line_checkin_greet",
        "charAnim": "wave",
        "npcAnim": "talk",
        "recordInStory": true
      },
      {
        "id": "hand_over_passport",
        "labelEn": "Give passport to agent",
        "labelVi": "Đưa hộ chiếu cho nhân viên",
        "lineId": "line_give_passport",
        "charAnim": "interact",
        "npcAnim": "check_passport",
        "requiresInventory": "passport",
        "objTargetState": "checked_in",
        "grantsInventory": "boarding_pass",
        "blockedReasonVi": "Bạn cần lấy hộ chiếu từ trong vali trước.",
        "blockedReasonEn": "Please take your passport from the suitcase first.",
        "recordInStory": true
      }
    ]
  }
]
```

*(Các đồ vật bắt buộc khác trong `objects.json` tuân theo đúng cấu trúc trên gồm: `departure_board`, `baggage_drop`, `self_kiosk`, `luggage_cart`, `security_tray_table`, `xray_scanner`, `metal_detector`, `pickup_bench`, `lounge_seat_row_a`, `lounge_seat_row_b`, `water_dispenser`, `lounge_flight_board`, `boarding_desk_12`, `boarding_scanner_gate`, `aircraft_window`).*

### 4.3. `airport-demo/data/npcs.json` (Chủ sở hữu: Agent 2)

```json
[
  {
    "id": "npc_checkin_agent",
    "role": "Check-in Agent",
    "nameEn": "Mia (Check-in Agent)",
    "nameVi": "Mia (Nhân viên thủ tục)",
    "zoneId": "zone_checkin",
    "x": 352,
    "y": 468,
    "footY": 480,
    "facing": "down",
    "approachPoint": { "x": 352, "y": 624, "facing": "up" },
    "defaultAnim": "idle",
    "greetingLineId": "line_npc_checkin_welcome"
  },
  {
    "id": "npc_airport_staff",
    "role": "Airport Staff",
    "nameEn": "David (Airport Guide)",
    "nameVi": "David (Nhân viên hướng dẫn)",
    "zoneId": "zone_checkin",
    "x": 640,
    "y": 1280,
    "footY": 1280,
    "facing": "down",
    "approachPoint": { "x": 640, "y": 1336, "facing": "up" },
    "defaultAnim": "idle",
    "greetingLineId": "line_npc_staff_help"
  },
  {
    "id": "npc_security_officer",
    "role": "Security Officer",
    "nameEn": "Officer Leo",
    "nameVi": "Nhân viên an ninh Leo",
    "zoneId": "zone_security",
    "x": 1632,
    "y": 576,
    "footY": 576,
    "facing": "down",
    "approachPoint": { "x": 1568, "y": 640, "facing": "up" },
    "defaultAnim": "idle",
    "greetingLineId": "line_npc_security_instruct"
  },
  {
    "id": "npc_passenger",
    "role": "Passenger",
    "nameEn": "Linh (Traveler)",
    "nameVi": "Hành khách Linh",
    "zoneId": "zone_lounge",
    "x": 2528,
    "y": 1184,
    "footY": 1192,
    "facing": "down",
    "approachPoint": { "x": 2464, "y": 1248, "facing": "up" },
    "defaultAnim": "sit_idle",
    "greetingLineId": "line_npc_passenger_seat"
  },
  {
    "id": "npc_gate_attendant",
    "role": "Gate Attendant",
    "nameEn": "Sophia (Gate 12)",
    "nameVi": "Sophia (Nhân viên cửa bay 12)",
    "zoneId": "zone_boarding",
    "x": 2496,
    "y": 432,
    "footY": 448,
    "facing": "down",
    "approachPoint": { "x": 2496, "y": 536, "facing": "up" },
    "defaultAnim": "idle",
    "greetingLineId": "line_npc_gate_ready"
  }
]
```

### 4.4. `airport-demo/data/lines.json` (Chủ sở hữu: Agent 3)

```json
{
  "line_checkin_greet": {
    "id": "line_checkin_greet",
    "speaker": "player",
    "en": "Hello, I'd like to check in.",
    "vi": "Xin chào, tôi muốn làm thủ tục chuyến bay.",
    "phonetic": "/həˈloʊ, aɪd laɪk tə tʃek ɪn/",
    "audioMp3": "assets/audio/voice_c_checkin_greet.mp3",
    "npcReplyLineId": "line_npc_checkin_welcome",
    "storyClauseEn": "I greeted the agent to check in for my flight",
    "storyClauseVi": "tôi đã chào nhân viên để làm thủ tục chuyến bay",
    "vocab": [
      { "word": "check in", "pos": "phrasal verb", "vi": "làm thủ tục登 ký chuyến bay" }
    ]
  },
  "line_give_passport": {
    "id": "line_give_passport",
    "speaker": "player",
    "en": "Here is my passport.",
    "vi": "Đây là hộ chiếu của tôi.",
    "phonetic": "/hɪr ɪz maɪ ˈpæspɔːrt/",
    "audioMp3": "assets/audio/voice_c_give_passport.mp3",
    "storyClauseEn": "I handed over my passport at the counter",
    "storyClauseVi": "tôi đã đưa hộ chiếu tại quầy",
    "vocab": [
      { "word": "passport", "pos": "noun", "vi": "hộ chiếu" }
    ]
  },
  "line_check_bag": {
    "id": "line_check_bag",
    "speaker": "player",
    "en": "I'd like to check this bag.",
    "vi": "Tôi muốn ký gửi kiện hành lý này.",
    "phonetic": "/aɪd laɪk tə tʃek ðɪs bæɡ/",
    "audioMp3": "assets/audio/voice_c_check_bag.mp3",
    "storyClauseEn": "I placed my bag on the belt to check it in",
    "storyClauseVi": "tôi đã đặt túi lên băng chuyền để ký gửi",
    "vocab": [
      { "word": "check a bag", "pos": "phrase", "vi": "ký gửi hành lý" }
    ]
  },
  "line_open_suitcase": {
    "id": "line_open_suitcase",
    "speaker": "player",
    "en": "I'm opening my suitcase.",
    "vi": "Tôi đang mở vali của mình.",
    "phonetic": "/aɪm ˈoʊpənɪŋ maɪ ˈsuːtkeɪs/",
    "audioMp3": "assets/audio/voice_c_open_suitcase.mp3",
    "storyClauseEn": "I opened my suitcase",
    "storyClauseVi": "tôi đã mở chiếc vali của mình",
    "vocab": [
      { "word": "suitcase", "pos": "noun", "vi": "vali" }
    ]
  },
  "line_close_suitcase": {
    "id": "line_close_suitcase",
    "speaker": "player",
    "en": "I'm closing my suitcase.",
    "vi": "Tôi đang đóng vali lại.",
    "phonetic": "/aɪm ˈkloʊzɪŋ maɪ ˈsuːtkeɪs/",
    "audioMp3": "assets/audio/voice_c_close_suitcase.mp3",
    "storyClauseEn": "I zipped up and closed my suitcase",
    "storyClauseVi": "tôi đã kéo khóa và đóng vali lại",
    "vocab": [
      { "word": "close", "pos": "verb", "vi": "đóng lại" }
    ]
  },
  "line_where_gate_12": {
    "id": "line_where_gate_12",
    "speaker": "player",
    "en": "Where is Gate 12?",
    "vi": "Cửa lên máy bay số 12 ở đâu vậy?",
    "phonetic": "/wer ɪz ɡeɪt twelv/",
    "audioMp3": "assets/audio/voice_c_where_gate_12.mp3",
    "storyClauseEn": "I asked the staff where Gate 12 was",
    "storyClauseVi": "tôi đã hỏi nhân viên đường tới Cửa số 12",
    "vocab": [
      { "word": "gate", "pos": "noun", "vi": "cửa ra tàu bay" }
    ]
  },
  "line_flight_leave_time": {
    "id": "line_flight_leave_time",
    "speaker": "player",
    "en": "What time does my flight leave?",
    "vi": "Mấy giờ chuyến bay của tôi khởi hành?",
    "phonetic": "/wʌt taɪm dʌz maɪ flaɪt liːv/",
    "audioMp3": "assets/audio/voice_c_flight_leave_time.mp3",
    "storyClauseEn": "I checked what time my flight would leave on the departure board",
    "storyClauseVi": "tôi đã xem giờ bay trên bảng thông tin",
    "vocab": [
      { "word": "flight", "pos": "noun", "vi": "chuyến bay" },
      { "word": "leave", "pos": "verb", "vi": "rời đi / khởi hành" }
    ]
  },
  "line_is_seat_taken": {
    "id": "line_is_seat_taken",
    "speaker": "player",
    "en": "Excuse me, is this seat taken?",
    "vi": "Xin lỗi, chỗ ngồi này có ai ngồi chưa ạ?",
    "phonetic": "/ɪkˈskjuːz miː, ɪz ðɪs siːt ˈteɪkən/",
    "audioMp3": "assets/audio/voice_c_is_seat_taken.mp3",
    "storyClauseEn": "I politely asked if the lounge seat was taken before sitting down",
    "storyClauseVi": "tôi đã lịch sự hỏi xem ghế chờ có trống không trước khi ngồi",
    "vocab": [
      { "word": "seat", "pos": "noun", "vi": "chỗ ngồi / ghế" },
      { "word": "taken", "pos": "adjective", "vi": "đã có người lấy/ngồi" }
    ]
  },
  "line_may_i_board": {
    "id": "line_may_i_board",
    "speaker": "player",
    "en": "May I board now?",
    "vi": "Bây giờ tôi có thể lên máy bay được chưa?",
    "phonetic": "/meɪ aɪ bɔːrd naʊ/",
    "audioMp3": "assets/audio/voice_c_may_i_board.mp3",
    "storyClauseEn": "I showed my boarding pass at Gate 12 and asked to board the plane",
    "storyClauseVi": "tôi đã xuất trình thẻ lên máy bay tại Cửa 12 và xin phép lên tàu bay",
    "vocab": [
      { "word": "board", "pos": "verb", "vi": "lên máy bay / tàu" }
    ]
  }
}
```

### 4.5. `airport-demo/data/quests.json` (Chủ sở hữu: Agent 3)

```json
[
  {
    "id": "q1_prepare_and_board_info",
    "order": 1,
    "titleEn": "1. Prepare Your Documents",
    "titleVi": "1. Chuẩn bị giấy tờ & Xem bảng chuyến bay",
    "zoneId": "zone_checkin",
    "steps": [
      {
        "id": "step_check_board",
        "labelEn": "Check the Departure Board",
        "labelVi": "Kiểm tra bảng thông tin chuyến bay",
        "requiredActionId": "inspect_departure_board"
      },
      {
        "id": "step_open_suitcase",
        "labelEn": "Open your suitcase",
        "labelVi": "Mở vali hành lý của bạn",
        "requiredActionId": "open_suitcase"
      },
      {
        "id": "step_take_passport",
        "labelEn": "Take out your passport",
        "labelVi": "Lấy hộ chiếu ra khỏi vali",
        "requiredActionId": "take_passport",
        "requiredInventory": "passport"
      },
      {
        "id": "step_close_suitcase",
        "labelEn": "Close your suitcase",
        "labelVi": "Đóng vali lại gọn gàng",
        "requiredActionId": "close_suitcase",
        "requiredObjectState": { "objectId": "player_suitcase", "state": "closed" }
      }
    ]
  },
  {
    "id": "q2_check_in_for_flight",
    "order": 2,
    "titleEn": "2. Check in for Your Flight",
    "titleVi": "2. Làm thủ tục tại Quầy Check-in",
    "zoneId": "zone_checkin",
    "steps": [
      {
        "id": "step_greet_agent",
        "labelEn": "Say: \"Hello, I'd like to check in.\"",
        "labelVi": "Chào nhân viên tại quầy thủ tục",
        "requiredActionId": "greet_checkin_agent"
      },
      {
        "id": "step_give_passport",
        "labelEn": "Give your passport to the agent",
        "labelVi": "Đưa hộ chiếu và nhận thẻ lên máy bay",
        "requiredActionId": "hand_over_passport",
        "requiredInventory": "boarding_pass"
      },
      {
        "id": "step_drop_baggage",
        "labelEn": "Check your bag at the Baggage Drop",
        "labelVi": "Gửi hành lý lên băng chuyền",
        "requiredActionId": "drop_baggage_on_belt"
      }
    ]
  },
  {
    "id": "q3_pass_security",
    "order": 3,
    "titleEn": "3. Pass Security Screening",
    "titleVi": "3. Đi qua Khu Kiểm tra An ninh",
    "zoneId": "zone_security",
    "steps": [
      {
        "id": "step_place_tray",
        "labelEn": "Put your items into the security tray",
        "labelVi": "Đặt đồ cá nhân vào khay soi chiếu",
        "requiredActionId": "place_items_in_tray"
      },
      {
        "id": "step_walk_detector",
        "labelEn": "Walk through the metal detector gate",
        "labelVi": "Đi qua cổng từ an ninh",
        "requiredActionId": "walk_through_detector"
      },
      {
        "id": "step_pickup_items",
        "labelEn": "Collect your scanned items",
        "labelVi": "Nhận lại đồ ở bàn bên kia",
        "requiredActionId": "collect_scanned_items"
      }
    ]
  },
  {
    "id": "q4_lounge_and_boarding",
    "order": 4,
    "titleEn": "4. Lounge Rest & Board at Gate 12",
    "titleVi": "4. Nghỉ tại Phòng chờ & Lên máy bay ở Cửa 12",
    "zoneId": "zone_boarding",
    "steps": [
      {
        "id": "step_sit_lounge",
        "labelEn": "Ask \"Is this seat taken?\" and sit in the Waiting Lounge",
        "labelVi": "Hỏi chỗ ngồi và ngồi nghỉ tại Phòng chờ",
        "requiredActionId": "sit_lounge_seat"
      },
      {
        "id": "step_ask_board",
        "labelEn": "Go to Gate 12 and ask: \"May I board now?\"",
        "labelVi": "Tới Cửa số 12 và hỏi nhân viên lên máy bay",
        "requiredActionId": "ask_to_board"
      },
      {
        "id": "step_scan_pass",
        "labelEn": "Scan your boarding pass to open Gate 12",
        "labelVi": "Quét thẻ lên máy bay để qua cửa",
        "requiredActionId": "scan_boarding_pass"
      }
    ]
  }
]
```

---

## 5. QUY TẮC QUẢN LÝ TRẠNG THÁI & GIAO THỨC GỌI HÀM (`STATE & CALL PROTOCOLS`)

### 5.1. Quy tắc 3 Nguồn Trạng thái Độc lập (Bắt buộc tuân thủ)
1. **`currentState` (`worldState` trong `gameplay/interaction.js`):**
   - Là nguồn sự thật duy nhất (Single Source of Truth) về trạng thái hiện tại của mọi đồ vật (`objects[objectId].state`), túi đồ (`inventory[]`) và tư thế nhân vật (`player.sittingOnSeatId`).
   - Khi kiểm tra một nút hành động có được phép bấm hay không, **100% chỉ gọi `canExecuteAction(actionId, currentState)`**.
   - **CẤM:** Không được lưu một cờ `done: true` hay `hasExecuted: true` để khóa nút hành động hoặc biến nút hành động chính thành nút "chỉ phát lại âm thanh".
2. **`actionExecution` (`activeRun` trong `gameplay/interaction.js`):**
   - Mỗi lần người chơi bấm nút hành động hợp lệ, tạo một đối tượng thực thi mới `{ runId: "run_" + (++seq), actionId, status: "approaching" }`.
   - Khi hành động hoàn tất (`status = "completed"`) hoặc bị hủy (`status = "cancelled"`), xóa `activeRun = null` ngay lập tức để sẵn sàng cho lần bấm tiếp theo.
3. **`narrationHistory` (`recordedActionIds: Set<string>` trong `gameplay/narration.js`):**
   - Chỉ được dùng để quyết định có thêm câu mới vào *"Phần đoạn văn của tôi"* hay chỉ tăng bộ đếm `practiceCount`.
   - **CẤM:** Không module nào được dùng `narration.hasRecorded(actionId)` để chặn `InteractionSystem.requestAction(actionId)`.

### 5.2. Giao thức Chuẩn Khi Thực thi 1 Hành động (Step-by-Step Protocol)
Khi người chơi bấm vào nút hành động `[data-action-id="open_suitcase"]` (dù là lần thứ 1, lần thứ 2 hay lần thứ 10):
1. **Bước 1 — Kiểm tra điều kiện:**
   - Gọi `const check = InteractionSystem.canExecuteAction("open_suitcase")`.
   - Nếu `!check.ok` (ví dụ vali đang mở sẵn): phát `bus.emit("action:blocked", { actionId, reasonVi: check.reasonVi })` → `UIManager.showToast(check.reasonVi, "warning")`, dừng tại đây.
2. **Bước 2 — Tiếp cận đối tượng (`Approach`):**
   - Lấy `approach = WorldScene.getApproachPoint("player_suitcase", charPos.x, charPos.y)`.
   - Gọi `CharacterController.moveTo(approach.x, approach.y, { onArrive })`.
3. **Bước 3 — Chạy Animation & Phát Âm thanh song song (Khi tới `approachPoint`):**
   - `CharacterController.setFacing(approach.facing)`.
   - Phát sự kiện `bus.emit("action:started", { runId, actionId: "open_suitcase", targetId: "player_suitcase", lineId: "line_open_suitcase" })`.
   - Gọi **Luồng B (Âm thanh & Bong bóng thoại)** không chặn:
     ```javascript
     AudioManager.speakLine("line_open_suitcase");
     UIManager.showWorldSpeechBubble("player", line.en, line.vi, 2600);
     ```
   - Gọi **Luồng A (Animation Nhân vật & Đồ vật)** và đợi hoàn tất:
     ```javascript
     await Promise.all([
       CharacterController.playActionAnim("interact", { durationMs: 450 }),
       WorldScene.setObjectVisualState("player_suitcase", "open", { animate: true })
     ]);
     ```
4. **Bước 4 — Cập nhật `currentState`, `NarrationManager` và `QuestManager`:**
   - Cập nhật `currentState.objects.player_suitcase.state = "open"`.
   - Phát `bus.emit("action:state-applied", ...)`.
   - Gọi **Luồng C (`NarrationManager`)**:
     ```javascript
     NarrationManager.recordCompletedAction("open_suitcase");
     // Lần 1: thêm "I opened my suitcase" vào đoạn văn.
     // Lần 2, 3...: chỉ tăng practiceCount, KHÔNG thêm câu trùng vào đoạn văn.
     ```
   - Gọi `QuestManager.evaluateProgress("open_suitcase", currentState)`.
   - Phát `bus.emit("action:completed", { runId, actionId: "open_suitcase", worldState: currentState })`.
   - `UIManager.refreshAllPanels()` tự động cập nhật lại `ActionPopover`: nút `"Open the suitcase"` chuyển sang disabled (kèm lý do *"Vali đang mở rồi"*), còn nút `"Close the suitcase"` sáng lên sẵn sàng cho người chơi bấm!

### 5.3. Hook Kiểm thử Tự động Toàn cục (`window.ELW_AIRPORT`)
Để Agent 3 (Unit Tests) và Agent 4 (Playwright E2E Tests) kiểm tra trạng thái chính xác mà không cần phụ thuộc vào DOM nội bộ, `airport-demo/index.html` bắt buộc expose đối tượng sau:

```javascript
window.ELW_AIRPORT = {
  bus,                  // core/bus.js
  loop,                 // core/loop.js
  camera,               // core/camera.js
  nav,                  // core/nav.js
  audio,                // core/audio.js
  save,                 // core/state.js
  world,                // world/scene.js & props.js
  character,            // actors/character.js
  pet,                  // actors/pet.js
  npcs,                 // actors/npc.js
  interaction,          // gameplay/interaction.js
  narration,            // gameplay/narration.js
  dialogue,             // gameplay/dialogue.js
  learning,             // gameplay/learning.js
  quest,                // gameplay/quest.js
  ui,                   // ui/ui-manager.js
  getSnapshot: () => ({
    player: character.getPosition(),
    playerState: character.getState(),
    pet: pet.getPosition(),
    worldState: interaction.getWorldState(),
    storyText: narration.buildParagraphText(),
    storyEntries: narration.getStoryEntries(),
    activeQuest: quest.getActiveQuest()
  })
};
```
