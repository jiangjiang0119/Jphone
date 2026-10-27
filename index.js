(function () {
    'use strict';

    // 移除旧版本残留（如果有的话）
    const oldEl = document.getElementById('jj-sweet-phone-wrapper');
    if (oldEl) oldEl.remove();
    const oldBackdrop = document.getElementById('jj-phone-backdrop');
    if (oldBackdrop) oldBackdrop.remove();
    const oldWand = document.getElementById('jj-wand-phone-item');
    if (oldWand) oldWand.remove();

    // ==================== 1. 注入低饱和浅色系 + 6~12px精致圆角 CSS ====================
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --jj-bg-milk: #FFFDF9;
            --jj-bg-blush: #FDF2F0;
            --jj-card-bg: #FFFFFF;
            --jj-border-soft: #F2DCD6;
            --jj-text-main: #8C5E64;
            --jj-text-muted: #B88E92;
            --jj-peach-main: #F4A7A3;
            --jj-peach-hover: #EE9590;
            --jj-apricot: #F7C59F;
            --jj-sakura-light: #FADAD8;
            --jj-hangup-red: #E88B8C;
            --jj-shadow: rgba(184, 142, 146, 0.22);
        }

        /* 魔法棒菜单项 */
        #jj-wand-phone-item {
            cursor: pointer;
            transition: background 0.2s;
        }
        #jj-wand-phone-item:hover {
            background: rgba(244, 167, 163, 0.15) !important;
        }

        /* 全屏居中遮罩层（彻底防止乱飘，点击外部可直接关闭） */
        #jj-phone-backdrop {
            position: fixed;
            top: 0;
            left: 0;
            right: 0;
            bottom: 0;
            width: 100vw;
            height: 100dvh;
            background: rgba(255, 250, 248, 0.45);
            backdrop-filter: blur(2px);
            z-index: 2147483640 !important;
            display: none;
            align-items: center;
            justify-content: center;
            padding: 20px;
            box-sizing: border-box;
        }
        #jj-phone-backdrop.jj-show {
            display: flex !important;
        }

        /* 绛の手机 主体框（圆角 12px） */
        #jj-sweet-phone-wrapper {
            width: 325px;
            max-width: 92vw;
            max-height: 76dvh;
            background: var(--jj-bg-milk);
            border-radius: 12px;
            border: 2px solid var(--jj-border-soft);
            box-shadow: 0 12px 36px var(--jj-shadow);
            display: flex;
            flex-direction: column;
            overflow: hidden;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            color: var(--jj-text-main);
            animation: jjFadeIn 0.2s ease-out;
        }
        @keyframes jjFadeIn {
            from { opacity: 0; transform: scale(0.96); }
            to { opacity: 1; transform: scale(1); }
        }

        /* 顶部标题栏（固定在顶部，绝不消失） */
        .jj-phone-statusbar {
            height: 42px;
            padding: 0 14px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--jj-bg-milk);
            border-bottom: 1px solid var(--jj-border-soft);
            flex-shrink: 0;
            user-select: none;
        }
        .jj-phone-title {
            font-size: 14px;
            font-weight: 700;
            color: var(--jj-text-main);
            letter-spacing: 0.5px;
        }
        .jj-status-time {
            font-size: 12px;
            color: var(--jj-text-muted);
            font-weight: 500;
        }
        .jj-close-phone {
            cursor: pointer;
            font-size: 14px;
            color: var(--jj-text-main);
            padding: 4px 8px;
            border-radius: 6px;
            background: var(--jj-bg-blush);
            border: 1px solid var(--jj-border-soft);
            line-height: 1;
        }
        .jj-close-phone:hover {
            background: var(--jj-sakura-light);
        }

        /* 屏幕内容通用容器 */
        .jj-screen {
            flex: 1;
            background: linear-gradient(180deg, var(--jj-bg-milk) 0%, var(--jj-bg-blush) 100%);
            padding: 12px 14px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 10px;
        }
        .jj-screen::-webkit-scrollbar {
            width: 4px;
        }
        .jj-screen::-webkit-scrollbar-thumb {
            background: var(--jj-sakura-light);
            border-radius: 4px;
        }

        /* 表单卡片（圆角 8px） */
        .jj-form-card {
            background: var(--jj-card-bg);
            border-radius: 8px;
            padding: 10px 12px;
            border: 1px solid var(--jj-border-soft);
            box-shadow: 0 2px 6px rgba(244, 167, 163, 0.06);
            display: flex;
            flex-direction: column;
            gap: 6px;
            flex-shrink: 0;
        }
        .jj-form-card label {
            font-size: 12px;
            font-weight: 600;
            color: var(--jj-text-main);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }

        /* 下拉框与输入框（圆角 6px） */
        .jj-select, .jj-input {
            width: 100%;
            padding: 7px 10px;
            border-radius: 6px;
            border: 1px solid var(--jj-border-soft);
            background: var(--jj-bg-milk);
            color: var(--jj-text-main);
            font-size: 12.5px;
            outline: none;
            box-sizing: border-box;
        }
        .jj-select:focus, .jj-input:focus {
            border-color: var(--jj-peach-main);
            background: #FFFFFF;
        }

        /* 开关行 */
        .jj-toggle-row {
            display: flex;
            align-items: center;
            justify-content: space-between;
            font-size: 12px;
            color: var(--jj-text-main);
            padding: 2px 0;
        }
        .jj-checkbox {
            accent-color: var(--jj-peach-main);
            width: 15px;
            height: 15px;
            cursor: pointer;
        }

        /* 拨打按钮（圆角 8px） */
        .jj-call-btn {
            margin-top: 4px;
            background: linear-gradient(135deg, var(--jj-peach-main), var(--jj-apricot));
            color: #FFFFFF;
            border: none;
            border-radius: 8px;
            padding: 11px;
            font-size: 14px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 4px 12px rgba(244, 167, 163, 0.3);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 6px;
            flex-shrink: 0;
        }

        /* ==================== 通话中界面 ==================== */
        #jj-screen-incall {
            display: none;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            padding: 16px 14px;
        }
        .jj-caller-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            width: 100%;
        }
        .jj-avatar-ring {
            width: 76px;
            height: 76px;
            border-radius: 12px;
            padding: 3px;
            background: linear-gradient(135deg, var(--jj-sakura-light), var(--jj-apricot));
            box-shadow: 0 4px 14px rgba(244, 167, 163, 0.25);
        }
        .jj-avatar-ring img {
            width: 100%;
            height: 100%;
            border-radius: 10px;
            object-fit: cover;
            background: var(--jj-bg-milk);
        }
        .jj-caller-name {
            font-size: 16px;
            font-weight: 700;
            color: var(--jj-text-main);
            margin-top: 2px;
        }
        .jj-call-timer {
            font-size: 12px;
            color: var(--jj-text-muted);
            font-family: monospace;
            background: rgba(255, 255, 255, 0.8);
            padding: 2px 8px;
            border-radius: 6px;
            border: 1px solid var(--jj-border-soft);
        }
        .jj-call-status {
            font-size: 12px;
            color: var(--jj-peach-hover);
            min-height: 18px;
        }

        /* 实时语音/回复字幕框（圆角 8px） */
        .jj-subtitle-box {
            width: 100%;
            height: 135px;
            background: rgba(255, 255, 255, 0.88);
            border: 1px solid var(--jj-border-soft);
            border-radius: 8px;
            padding: 10px 12px;
            box-sizing: border-box;
            overflow-y: auto;
            font-size: 12.5px;
            line-height: 1.5;
            color: var(--jj-text-main);
            text-align: left;
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .jj-sub-item-user {
            align-self: flex-end;
            background: var(--jj-sakura-light);
            color: var(--jj-text-main);
            padding: 6px 10px;
            border-radius: 8px 8px 2px 8px;
            max-width: 85%;
        }
        .jj-sub-item-char {
            align-self: flex-start;
            background: var(--jj-bg-milk);
            border: 1px solid var(--jj-border-soft);
            color: var(--jj-text-main);
            padding: 6px 10px;
            border-radius: 8px 8px 8px 2px;
            max-width: 88%;
        }

        /* 键盘/语音输入栏（圆角 6px） */
        .jj-manual-input-row {
            width: 100%;
            display: flex;
            gap: 6px;
        }
        .jj-mini-send-btn {
            background: var(--jj-peach-main);
            color: #FFF;
            border: none;
            border-radius: 6px;
            padding: 0 14px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            flex-shrink: 0;
        }

        /* 底部通话控制栏（圆角 10px） */
        .jj-call-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding-top: 4px;
        }
        .jj-ctrl-btn {
            width: 46px;
            height: 46px;
            border-radius: 10px;
            border: 1px solid var(--jj-border-soft);
            background: #FFFFFF;
            color: var(--jj-text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 3px 8px var(--jj-shadow);
            font-size: 17px;
        }
        .jj-mic-btn {
            width: 56px;
            height: 56px;
            border-radius: 12px;
            background: linear-gradient(135deg, var(--jj-peach-main), var(--jj-apricot));
            color: #FFFFFF;
            border: 2px solid #FFFFFF;
            font-size: 22px;
        }
        .jj-mic-btn.jj-listening {
            background: var(--jj-hangup-red);
        }
        .jj-hangup-btn {
            background: var(--jj-hangup-red);
            color: #FFFFFF;
            border: none;
        }
        .jj-ctrl-label {
            font-size: 10px;
            color: var(--jj-text-muted);
            margin-top: 3px;
        }
    `;
    document.head.appendChild(style);

    // ==================== 2. 构建「绛の手机」界面 ====================
    const backdrop = document.createElement('div');
    backdrop.id = 'jj-phone-backdrop';
    backdrop.innerHTML = `
        <div id="jj-sweet-phone-wrapper">
            <div class="jj-phone-statusbar">
                <span class="jj-phone-title">绛の手机</span>
                <span class="jj-status-time" id="jj-status-time">12:00</span>
                <span class="jj-close-phone" id="jj-close-phone-btn" title="关闭">✕</span>
            </div>

            <!-- 界面 1：拨号准备与设定选择 -->
            <div class="jj-screen" id="jj-screen-setup">
                <div class="jj-form-card">
                    <label><span>🧸 通话角色 (Character)</span> <span id="jj-refresh-btn" style="cursor:pointer;font-size:11px;color:var(--jj-peach-hover);">↻ 刷新</span></label>
                    <select class="jj-select" id="jj-select-char"></select>
                </div>

                <div class="jj-form-card">
                    <label><span>🎀 预设选择 (Preset)</span></label>
                    <select class="jj-select" id="jj-select-preset"></select>
                </div>

                <div class="jj-form-card">
                    <label><span>🌷 我的设定 (User Persona)</span></label>
                    <select class="jj-select" id="jj-select-persona"></select>
                </div>

                <div class="jj-form-card">
                    <label><span>📖 世界书 (World Info)</span></label>
                    <select class="jj-select" id="jj-select-world"></select>
                </div>

                <div class="jj-form-card">
                    <label><span>💭 补充通话情境 (选填)</span></label>
                    <input type="text" class="jj-input" id="jj-input-scenario" placeholder="例如：深夜睡不着打给TA / 刚下班..." />
                    <div class="jj-toggle-row" style="margin-top:4px;">
                        <span>✨ 纯口语电话模式 (只说对白)</span>
                        <input type="checkbox" class="jj-checkbox" id="jj-check-oral-mode" checked />
                    </div>
                    <div class="jj-toggle-row">
                        <span>🔊 自动播放酒馆 TTS 语音</span>
                        <input type="checkbox" class="jj-checkbox" id="jj-check-auto-tts" checked />
                    </div>
                </div>

                <button class="jj-call-btn" id="jj-start-call-btn">
                    <span>📞</span> 拨通电话
                </button>
            </div>

            <!-- 界面 2：通话中界面 -->
            <div class="jj-screen" id="jj-screen-incall">
                <div class="jj-caller-info">
                    <div class="jj-avatar-ring">
                        <img id="jj-incall-avatar" src="/img/ai4.png" alt="avatar" />
                    </div>
                    <div class="jj-caller-name" id="jj-incall-name">通话对象</div>
                    <div class="jj-call-timer" id="jj-incall-timer">00:00</div>
                    <div class="jj-call-status" id="jj-incall-status">✨ 通话已接通，点击下方麦克风说话</div>
                </div>

                <div class="jj-subtitle-box" id="jj-subtitle-box">
                    <div class="jj-sub-item-char">（电话接通啦，快跟对方说第一句话吧~）</div>
                </div>

                <div class="jj-manual-input-row">
                    <input type="text" class="jj-input" id="jj-manual-text" placeholder="可点麦克风或用键盘语音输入..." />
                    <button class="jj-mini-send-btn" id="jj-manual-send">发送</button>
                </div>

                <div class="jj-call-controls">
                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <button class="jj-ctrl-btn" id="jj-btn-replay-tts" title="重播上一句语音">🔈</button>
                        <span class="jj-ctrl-label">重播语音</span>
                    </div>

                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <button class="jj-ctrl-btn jj-mic-btn" id="jj-btn-mic" title="点击开始/结束说话">🎙️</button>
                        <span class="jj-ctrl-label" id="jj-mic-label">点击说话</span>
                    </div>

                    <div style="display:flex;flex-direction:column;align-items:center;">
                        <button class="jj-ctrl-btn jj-han