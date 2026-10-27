(function () {
    'use strict';

    // 防止重复加载
    if (document.getElementById('jj-sweet-phone-wrapper')) return;

    // ==================== 1. 注入低饱和奶油蜜桃浅色系 CSS ====================
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --jj-bg-milk: #FFFDF9;
            --jj-bg-blush: #FDF2F0;
            --jj-card-bg: #FFFFFF;
            --jj-border-soft: #F5E1DA;
            --jj-text-main: #8C5E64;      /* 温柔干枯玫瑰色，替代黑/棕 */
            --jj-text-muted: #B88E92;     /* 浅粉雾灰 */
            --jj-peach-main: #F4A7A3;     /* 低饱和蜜桃粉 */
            --jj-peach-hover: #EE9590;
            --jj-apricot: #F7C59F;        /* 奶油杏橘色 */
            --jj-sakura-light: #FADAD8;   /* 浅樱花粉 */
            --jj-hangup-red: #E88B8C;     /* 柔和珊瑚红 */
            --jj-shadow: rgba(232, 165, 152, 0.22);
        }

        /* 悬浮开启按钮 */
        #jj-phone-float-btn {
            position: fixed;
            right: 24px;
            bottom: 90px;
            width: 52px;
            height: 52px;
            border-radius: 50%;
            background: linear-gradient(135deg, var(--jj-peach-main), var(--jj-apricot));
            box-shadow: 0 6px 18px var(--jj-shadow);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            z-index: 9998;
            border: 3px solid var(--jj-bg-milk);
            transition: transform 0.25s ease, box-shadow 0.25s ease;
            user-select: none;
        }
        #jj-phone-float-btn:hover {
            transform: scale(1.08) rotate(-6deg);
            box-shadow: 0 8px 22px rgba(232, 165, 152, 0.38);
        }
        #jj-phone-float-btn span {
            font-size: 24px;
            filter: drop-shadow(0 2px 3px rgba(140, 94, 100, 0.15));
        }

        /* 小手机主体外框 */
        #jj-sweet-phone-wrapper {
            position: fixed;
            right: 85px;
            bottom: 40px;
            width: 330px;
            height: 600px;
            max-height: 86vh;
            background: var(--jj-bg-milk);
            border-radius: 38px;
            border: 6px solid var(--jj-border-soft);
            box-shadow: 0 14px 36px var(--jj-shadow), inset 0 0 0 2px #FFFFFF;
            z-index: 9999;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            color: var(--jj-text-main);
            transition: opacity 0.3s ease, transform 0.3s ease;
        }
        #jj-sweet-phone-wrapper.jj-show {
            display: flex;
            animation: jjPopIn 0.3s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes jjPopIn {
            from { opacity: 0; transform: translateY(20px) scale(0.95); }
            to { opacity: 1; transform: translateY(0) scale(1); }
        }

        /* 顶部状态栏（可拖拽） */
        .jj-phone-statusbar {
            height: 36px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--jj-bg-milk);
            font-size: 12px;
            font-weight: 600;
            color: var(--jj-text-muted);
            cursor: move;
            user-select: none;
            border-bottom: 1px dashed var(--jj-border-soft);
            flex-shrink: 0;
        }
        .jj-notch {
            width: 70px;
            height: 14px;
            background: var(--jj-sakura-light);
            border-radius: 10px;
        }
        .jj-close-phone {
            cursor: pointer;
            font-size: 15px;
            color: var(--jj-text-muted);
            padding: 2px 6px;
            border-radius: 8px;
        }
        .jj-close-phone:hover {
            background: var(--jj-bg-blush);
            color: var(--jj-text-main);
        }

        /* 屏幕内容通用容器 */
        .jj-screen {
            flex: 1;
            background: linear-gradient(180deg, var(--jj-bg-milk) 0%, var(--jj-bg-blush) 100%);
            padding: 16px 18px;
            overflow-y: auto;
            display: flex;
            flex-direction: column;
            gap: 12px;
        }
        .jj-screen::-webkit-scrollbar {
            width: 4px;
        }
        .jj-screen::-webkit-scrollbar-thumb {
            background: var(--jj-sakura-light);
            border-radius: 4px;
        }

        /* 标题区 */
        .jj-header-title {
            text-align: center;
            margin-bottom: 2px;
        }
        .jj-header-title h3 {
            margin: 0;
            font-size: 17px;
            color: var(--jj-text-main);
            font-weight: 700;
        }
        .jj-header-title p {
            margin: 3px 0 0;
            font-size: 11px;
            color: var(--jj-text-muted);
        }

        /* 表单卡片 */
        .jj-form-card {
            background: var(--jj-card-bg);
            border-radius: 18px;
            padding: 11px 14px;
            border: 1px solid var(--jj-border-soft);
            box-shadow: 0 3px 10px rgba(244, 167, 163, 0.08);
            display: flex;
            flex-direction: column;
            gap: 5px;
        }
        .jj-form-card label {
            font-size: 12px;
            font-weight: 600;
            color: var(--jj-text-main);
            display: flex;
            align-items: center;
            justify-content: space-between;
        }
        .jj-select, .jj-input {
            width: 100%;
            padding: 7px 10px;
            border-radius: 12px;
            border: 1px solid var(--jj-border-soft);
            background: var(--jj-bg-milk);
            color: var(--jj-text-main);
            font-size: 12.5px;
            outline: none;
            transition: border-color 0.2s;
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
            padding: 4px 2px;
        }
        .jj-checkbox {
            accent-color: var(--jj-peach-main);
            width: 15px;
            height: 15px;
            cursor: pointer;
        }

        /* 拨打按钮 */
        .jj-call-btn {
            margin-top: auto;
            background: linear-gradient(135deg, var(--jj-peach-main), var(--jj-apricot));
            color: #FFFFFF;
            border: none;
            border-radius: 24px;
            padding: 13px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 6px 16px rgba(244, 167, 163, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            transition: transform 0.2s, box-shadow 0.2s;
        }
        .jj-call-btn:hover {
            transform: translateY(-2px);
            box-shadow: 0 8px 20px rgba(244, 167, 163, 0.48);
        }

        /* ==================== 通话中界面 ==================== */
        #jj-screen-incall {
            display: none;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            padding: 24px 18px 20px;
        }
        .jj-caller-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 8px;
            width: 100%;
        }
        .jj-avatar-ring {
            width: 96px;
            height: 96px;
            border-radius: 50%;
            padding: 5px;
            background: linear-gradient(135deg, var(--jj-sakura-light), var(--jj-apricot));
            box-shadow: 0 6px 20px rgba(244, 167, 163, 0.28);
            position: relative;
            animation: jjPulse 2.4s infinite ease-in-out;
        }
        @keyframes jjPulse {
            0%, 100% { transform: scale(1); box-shadow: 0 6px 20px rgba(244, 167, 163, 0.25); }
            50% { transform: scale(1.05); box-shadow: 0 8px 28px rgba(244, 167, 163, 0.45); }
        }
        .jj-avatar-ring img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            background: var(--jj-bg-milk);
        }
        .jj-caller-name {
            font-size: 18px;
            font-weight: 700;
            color: var(--jj-text-main);
            margin-top: 4px;
        }
        .jj-call-timer {
            font-size: 13px;
            color: var(--jj-text-muted);
            font-family: monospace;
            background: rgba(255, 255, 255, 0.7);
            padding: 2px 10px;
            border-radius: 12px;
            border: 1px solid var(--jj-border-soft);
        }
        .jj-call-status {
            font-size: 12px;
            color: var(--jj-peach-hover);
            min-height: 18px;
        }

        /* 实时语音/回复字幕框 */
        .jj-subtitle-box {
            width: 100%;
            height: 150px;
            background: rgba(255, 255, 255, 0.82);
            border: 1px solid var(--jj-border-soft);
            border-radius: 20px;
            padding: 12px 14px;
            box-sizing: border-box;
            overflow-y: auto;
            font-size: 13px;
            line-height: 1.55;
            color: var(--jj-text-main);
            text-align: left;
            box-shadow: inset 0 2px 8px rgba(244, 167, 163, 0.08);
            display: flex;
            flex-direction: column;
            gap: 8px;
        }
        .jj-sub-item-user {
            align-self: flex-end;
            background: var(--jj-sakura-light);
            color: var(--jj-text-main);
            padding: 6px 11px;
            border-radius: 14px 14px 3px 14px;
            max-width: 85%;
            font-size: 12.5px;
        }
        .jj-sub-item-char {
            align-self: flex-start;
            background: var(--jj-bg-milk);
            border: 1px solid var(--jj-border-soft);
            color: var(--jj-text-main);
            padding: 7px 11px;
            border-radius: 14px 14px 14px 3px;
            max-width: 88%;
            font-size: 12.5px;
        }

        /* 备用打字输入框（默认折叠） */
        .jj-manual-input-row {
            width: 100%;
            display: none;
            gap: 6px;
        }
        .jj-manual-input-row.jj-active {
            display: flex;
        }
        .jj-mini-send-btn {
            background: var(--jj-peach-main);
            color: #FFF;
            border: none;
            border-radius: 12px;
            padding: 0 12px;
            font-size: 12px;
            cursor: pointer;
            flex-shrink: 0;
        }

        /* 底部通话控制栏 */
        .jj-call-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding-top: 6px;
        }
        .jj-ctrl-btn {
            width: 50px;
            height: 50px;
            border-radius: 50%;
            border: 1px solid var(--jj-border-soft);
            background: #FFFFFF;
            color: var(--jj-text-main);
            display: flex;
            flex-direction: column;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px var(--jj-shadow);
            transition: all 0.2s;
            font-size: 18px;
        }
        .jj-ctrl-btn:hover {
            transform: translateY(-2px);
            background: var(--jj-bg-milk);
        }
        /* 麦克风主按钮 */
        .jj-mic-btn {
            width: 66px;
            height: 66px;
            background: linear-gradient(135deg, var(--jj-peach-main), var(--jj-apricot));
            color: #FFFFFF;
            border: 3px solid #FFFFFF;
            font-size: 24px;
        }
        .jj-mic-btn.jj-listening {
            background: var(--jj-hangup-red);
            animation: jjMicWave 1.2s infinite;
        }
        @keyframes jjMicWave {
            0% { box-shadow: 0 0 0 0 rgba(232, 139, 140, 0.5); }
            70% { box-shadow: 0 0 0 14px rgba(232, 139, 140, 0); }
            100% { box-shadow: 0 0 0 0 rgba(232, 139, 140, 0); }
        }
        /* 挂断按钮 */
        .jj-hangup-btn {
            background: var(--jj-hangup-red);
            color: #FFFFFF;
            border: none;
        }
        .jj-ctrl-label {
            font-size: 10px;
            color: var(--jj-text-muted);
            margin-top: 4px;
        }
    `;
    document.head.appendChild(style);

    // ==================== 2. 构建小手机 HTML 结构 ====================
    const floatBtn = document.createElement('div');
    floatBtn.id = 'jj-phone-float-btn';
    floatBtn.title = '打开奶油蜜桃小手机';
    floatBtn.innerHTML = `<span>🍑</span>`;
    document.body.appendChild(floatBtn);

    const phoneWrapper = document.createElement('div');
    phoneWrapper.id = 'jj-sweet-phone-wrapper';
    phoneWrapper.innerHTML = `
        <div class="jj-phone-statusbar" id="jj-phone-drag-handle">
            <span id="jj-status-time">12:00</span>
            <div class="jj-notch"></div>
            <span class="jj-close-phone" id="jj-close-phone-btn" title="收起小手机">✕</span>
        </div>

        <!-- 界面 1：拨号准备与设定选择 -->
        <div class="jj-screen" id="jj-screen-setup">
            <div class="jj-header-title">
                <h3>🌸 蜜桃语音通话 🌸</h3>
                <p>选好设定，随时给TA拨通电话吧</p>
            </div>

            <div class="jj-form-card">
                <label><span>🧸 通话角色 (Character)</span> <span id="jj-refresh-btn" style="cursor:pointer;font-size:11px;color:var(--jj-peach-hover);">↻ 刷新列表</span></label>
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
                    <span title="开启后会让AI在通话期间只输出自然口语对白，方便TTS朗读">✨ 纯口语电话模式 (推荐开启)</span>
                    <input type="checkbox" class="jj-checkbox" id="jj-check-oral-mode" checked />
                </div>
                <div class="jj-toggle-row">
                    <span title="收到回复时自动触发酒馆TTS朗读">🔊 自动播放酒馆 TTS 语音</span>
                    <input type="checkbox" class="jj-checkbox" id="jj-check-auto-tts" checked />
                </div>
            </div>

            <button class="jj-call-btn" id="jj-start-call-btn">
                <span>📞</span> 拨通语音电话
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

            <div class="jj-manual-input-row" id="jj-manual-row">
                <input type="text" class="jj-input" id="jj-manual-text" placeholder="输入你想说的话..." />
                <button class="jj-mini-send-btn" id="jj-manual-send">发送</button>
            </div>

            <div class="jj-call-controls">
                <div style="display:flex;flex-direction:column;align-items:center;">
                    <button class="jj-ctrl-btn" id="jj-btn-replay-tts" title="让酒馆TTS重念上一句">🔈</button>
                    <span class="jj-ctrl-label">重播语音</span>
                </div>

                <div style="display:flex;flex-direction:column;align-items:center;">
                    <button class="jj-ctrl-btn jj-mic-btn" id="jj-btn-mic" title="点击开始/结束说话">🎙️</button>
                    <span class="jj-ctrl-label" id="jj-mic-label">点击说话</span>
                </div>

                <div style="display:flex;flex-direction:column;align-items:center;">
                    <button class="jj-ctrl-btn" id="jj-btn-keyboard" title="切换键盘打字">⌨️</button>
                    <span class="jj-ctrl-label">小键盘</span>
                </div>

                <div style="display:flex;flex-direction:column;align-items:center;">
                    <button class="jj-ctrl-btn jj-hangup-btn" id="jj-btn-hangup" title="挂断电话">📴</button>
                    <span class="jj-ctrl-label">挂断</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(phoneWrapper);

    // ==================== 3. 状态变量与工具函数 ====================
    let isCalling = false;
    let callSeconds = 0;
    let timerInterval = null;
    let recognition = null;
    let isListening = false;
    let lastRenderedMesId = -1;

    // 更新状态栏时间
    function updateClock() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const el = document.getElementById('jj-status-time');
        if (el) el.textContent = `${hh}:${mm}`;
    }
    setInterval(updateClock, 10000);
    updateClock();

    // 获取酒馆当前的预设下拉框 DOM
    function getSTPresetSelect() {
        const selectors = [
            '#settings_preset_openai',
            '#settings_preset_textgenerationwebui',
            '#settings_preset_novel',
            '#settings_preset_kobold'
        ];
        for (const sel of selectors) {
            const el = document.querySelector(sel);
            if (el && el.options && el.options.length > 0) return el;
        }
        return document.querySelector('select[id^="settings_preset_"]');
    }

    // 同步酒馆的 角色、预设、用户设定、世界书 到小手机
    function syncFromSillyTavern() {
        const ctx = window.SillyTavern?.getContext?.() || {};

        // 1. 同步角色列表
        const charSelect = document.getElementById('jj-select-char');
        charSelect.innerHTML = '';
        if (ctx.characters && Array.isArray(ctx.characters)) {
            ctx.characters.forEach((ch, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = ch.name;
                if (String(idx) === String(ctx.characterId)) opt.selected = true;
                charSelect.appendChild(opt);
            });
        } else {
            const opt = document.createElement('option');
            opt.textContent = '当前聊天角色';
            charSelect.appendChild(opt);
        }

        // 2. 同步预设列表
        const presetSelect = document.getElementById('jj-select-preset');
        presetSelect.innerHTML = '';
        const stPreset = getSTPresetSelect();
        if (stPreset) {
            Array.from(stPreset.options).forEach(o => {
                const opt = document.createElement('option');
                opt.value = o.value;
                opt.textContent = o.textContent;
                if (o.selected) opt.selected = true;
                presetSelect.appendChild(opt);
            });
        } else {
            presetSelect.innerHTML = `<option value="">保持当前酒馆预设</option>`;
        }

        // 3. 同步用户设定 (User Persona)
        const personaSelect = document.getElementById('jj-select-persona');
        personaSelect.innerHTML = `<option value="">保持当前用户设定</option>`;
        const avatarContainers = document.querySelectorAll('#user_avatar_block .avatar-container');
        avatarContainers.forEach(container => {
            const avatarId = container.getAttribute('data-avatar-id');
            const nameEl = container.querySelector('.ch_name');
            const isSelected = container.classList.contains('selected');
            if (avatarId) {
                const opt = document.createElement('option');
                opt.value = avatarId;
                opt.textContent = nameEl ? `${nameEl.textContent.trim()} (${avatarId})` : avatarId;
                if (isSelected) opt.selected = true;
                personaSelect.appendChild(opt);
            }
        });

        // 4. 同步世界书 (World Info)
        const worldSelect = document.getElementById('jj-select-world');
        worldSelect.innerHTML = `<option value="">保持当前世界书配置</option>`;
        const stWorld = document.getElementById('world_info');
        if (stWorld) {
            Array.from(stWorld.options).forEach(o => {
                if (!o.value || o.value === '') return;
                const opt = document.createElement('option');
                opt.value = o.value;
                opt.textContent = o.textContent + (o.selected ? ' (已启用)' : '');
                if (o.selected) opt.selected = true;
                worldSelect.appendChild(opt);
            });
        }
    }

    // 监听小手机下拉框变更并实时同步回酒馆
    document.getElementById('jj-select-char').addEventListener('change', async function () {
        const ctx = window.SillyTavern?.getContext?.();
        if (ctx && typeof ctx.selectCharacterById === 'function' && this.value !== '') {
            await ctx.selectCharacterById(Number(this.value));
        }
    });

    document.getElementById('jj-select-preset').addEventListener('change', function () {
        const stPreset = getSTPresetSelect();
        if (stPreset && this.value !== '') {
            stPreset.value = this.value;
            stPreset.dispatchEvent(new Event('change', { bubbles: true }));
            if (window.$) window.$(stPreset).trigger('change');
        }
    });

    document.getElementById('jj-select-persona').addEventListener('change', function () {
        if (!this.value) return;
        const target = document.querySelector(`#user_avatar_block .avatar-container[data-avatar-id="${this.value}"]`);
        if (target) target.click();
    });

    document.getElementById('jj-select-world').addEventListener('change', function () {
        const stWorld = document.getElementById('world_info');
        if (stWorld && this.value !== '') {
            Array.from(stWorld.options).forEach(o => {
                if (o.value === this.value) o.selected = true;
            });
            stWorld.dispatchEvent(new Event('change', { bubbles: true }));
            if (window.$) window.$(stWorld).trigger('change');
        }
    });

    document.getElementById('jj-refresh-btn').addEventListener('click', syncFromSillyTavern);

    // ==================== 4. 电话拨通与挂断逻辑 ====================
    function formatTime(sec) {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    // 执行酒馆斜杠命令辅助函数
    async function runSlashCommand(cmd) {
        const ctx = window.SillyTavern?.getContext?.();
        if (ctx && typeof ctx.executeSlashCommandsWithOptions === 'function') {
            await ctx.executeSlashCommandsWithOptions(cmd);
        } else if (ctx && typeof ctx.executeSlashCommands === 'function') {
            await ctx.executeSlashCommands(cmd);
        }
    }

    // 开启通话
    document.getElementById('jj-start-call-btn').addEventListener('click', async () => {
        isCalling = true;
        callSeconds = 0;

        // 获取当前角色头像与名称
        const ctx = window.SillyTavern?.getContext?.() || {};
        let charName = '心爱的TA';
        let charAvatar = '/img/ai4.png';

        if (ctx.characters && ctx.characterId !== undefined && ctx.characters[ctx.characterId]) {
            const ch = ctx.characters[ctx.characterId];
            charName = ch.name || charName;
            if (ch.avatar) {
                charAvatar = `/characters/${encodeURIComponent(ch.avatar)}`;
            }
        } else {
            const lastMesAvatar = document.querySelector('.mes:not([is_user="true"]) .avatar img');
            if (lastMesAvatar) charAvatar = lastMesAvatar.src;
        }

        document.getElementById('jj-incall-name').textContent = charName;
        document.getElementById('jj-incall-avatar').src = charAvatar;
        document.getElementById('jj-incall-timer').textContent = '00:00';
        document.getElementById('jj-subtitle-box').innerHTML = `
            <div class="jj-sub-item-char">📞 正在与 ${charName} 通话中...</div>
        `;

        // 自动确保酒馆 TTS 已启用
        if (document.getElementById('jj-check-auto-tts').checked) {
            const ttsCheckbox = document.getElementById('tts_enabled');
            if (ttsCheckbox && !ttsCheckbox.checked) {
                ttsCheckbox.click();
            }
        }

        // 如果开启了纯口语电话模式，注入轻量通话提示词
        const scenario = document.getElementById('jj-input-scenario').value.trim();
        const oralMode = document.getElementById('jj-check-oral-mode').checked;
        if (oralMode || scenario) {
            let promptText = `[系统提示：当前正在与用户进行实时语音电话通话。`;
            if (scenario) promptText += `当前通话情境：${scenario}。`;
            if (oralMode) promptText += `请使用自然、亲密的口语回答，只输出你在电话里说出口的话，不要输出任何动作、神态、心理描写或括号内容，以便语音TTS直接朗读。`;
            promptText += `]`;
            await runSlashCommand(`/inject id=jj_phone_call position=chat depth=0 ${promptText}`);
        }

        // 切换界面
        document.getElementById('jj-screen-setup').style.display = 'none';
        document.getElementById('jj-screen-incall').style.display = 'flex';

        // 启动计时器
        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            callSeconds++;
            document.getElementById('jj-incall-timer').textContent = formatTime(callSeconds);
        }, 1000);
    });

    // 挂断电话
    document.getElementById('jj-btn-hangup').addEventListener('click', async () => {
        isCalling = false;
        clearInterval(timerInterval);
        stopSpeechRecognition();

        // 清理电话模式注入提示词
        await runSlashCommand(`/flushinject jj_phone_call`);

        document.getElementById('jj-screen-incall').style.display = 'none';
        document.getElementById('jj-screen-setup').style.display = 'flex';
    });

    // ==================== 5. 发送消息与联动酒馆 TTS ====================
    function appendSubtitle(text, isUser = false) {
        const box = document.getElementById('jj-subtitle-box');
        const div = document.createElement('div');
        div.className = isUser ? 'jj-sub-item-user' : 'jj-sub-item-char';
        div.textContent = text;
        box.appendChild(div);
        box.scrollTop = box.scrollHeight;
    }

    function sendVoiceTextToTavern(text) {
        if (!text || !text.trim()) return;
        const cleanText = text.trim();
        appendSubtitle(cleanText, true);

        const statusEl = document.getElementById('jj-incall-status');
        statusEl.textContent = '💭 对方正在倾听并回应...';

        // 填入酒馆输入框并触发发送
        const textarea = document.getElementById('send_textarea');
        const sendBtn = document.getElementById('send_but');
        if (textarea && sendBtn) {
            textarea.value = cleanText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            sendBtn.click();
        }
    }

    // 触发最新一条 AI 消息的酒馆 TTS 朗读按钮
    function triggerTavernTTSOnLastMessage() {
        const aiMessages = document.querySelectorAll('#chat .mes[is_user="false"]');
        if (aiMessages.length === 0) return;
        const lastMes = aiMessages[aiMessages.length - 1];
        const narrateBtn = lastMes.querySelector('.mes_narrate');
        if (narrateBtn) {
            narrateBtn.click();
        }
    }

    // 重播按钮
    document.getElementById('jj-btn-replay-tts').addEventListener('click', () => {
        triggerTavernTTSOnLastMessage();
        document.getElementById('jj-incall-status').textContent = '🔊 正在为你重播语音...';
    });

    // 小键盘打字发送支持
    document.getElementById('jj-btn-keyboard').addEventListener('click', () => {
        document.getElementById('jj-manual-row').classList.toggle('jj-active');
    });
    document.getElementById('jj-manual-send').addEventListener('click', () => {
        const input = document.getElementById('jj-manual-text');
        if (input.value.trim()) {
            sendVoiceTextToTavern(input.value);
            input.value = '';
        }
    });
    document.getElementById('jj-manual-text').addEventListener('keydown', (e) => {
        if (e.key === 'Enter') {
            document.getElementById('jj-manual-send').click();
        }
    });

    // 监听酒馆 AI 回复完成事件
    function setupTavernMessageListener() {
        const ctx = window.SillyTavern?.getContext?.();
        if (ctx && ctx.eventSource && ctx.event_types) {
            ctx.eventSource.on(ctx.event_types.CHARACTER_MESSAGE_RENDERED, (mesId) => {
                if (!isCalling || mesId === lastRenderedMesId) return;
                lastRenderedMesId = mesId;
                handleNewAICallReply();
            });
        }
    }

    function handleNewAICallReply() {
        setTimeout(() => {
            const aiMessages = document.querySelectorAll('#chat .mes[is_user="false"]');
            if (aiMessages.length === 0) return;
            const lastMes = aiMessages[aiMessages.length - 1];
            const mesTextEl = lastMes.querySelector('.mes_text');
            if (mesTextEl) {
                const replyText = mesTextEl.innerText.trim();
                if (replyText) {
                    appendSubtitle(replyText, false);
                    document.getElementById('jj-incall-status').textContent = '🔊 对方正在说话...';
                }
            }

            // 如果酒馆没有开启全局自动朗读，但小手机勾选了自动朗读，则自动检查并触发
            if (document.getElementById('jj-check-auto-tts').checked) {
                const autoGenCheckbox = document.getElementById('tts_auto_generation');
                if (autoGenCheckbox && !autoGenCheckbox.checked) {
                    triggerTavernTTSOnLastMessage();
                }
            }
        }, 300);
    }

    // ==================== 6. 语音识别 (Web Speech API) ====================
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('宝，当前浏览器不支持原生语音识别功能，建议使用 Chrome 或 Edge 浏览器哦~');
            return null;
        }
        const rec = new SpeechRecognition();
        rec.lang = 'zh-CN';
        rec.interimResults = true;
        rec.continuous = false;

        rec.onstart = () => {
            isListening = true;
            document.getElementById('jj-btn-mic').classList.add('jj-listening');
            document.getElementById('jj-mic-label').textContent = '说完点此';
            document.getElementById('jj-incall-status').textContent = '🎙️ 正在倾听绛绛的声音...';
        };

        rec.onresult = (event) => {
            let transcript = '';
            let isFinal = false;
            for (let i = event.resultIndex; i < event.results.length; i++) {
                transcript += event.results[i][0].transcript;
                if (event.results[i].isFinal) isFinal = true;
            }
            document.getElementById('jj-incall-status').textContent = `🎙️ "${transcript}"`;
            if (isFinal && transcript.trim()) {
                sendVoiceTextToTavern(transcript);
            }
        };

        rec.onerror = (event) => {
            console.warn('语音识别提示:', event.error);
            stopSpeechRecognition();
            document.getElementById('jj-incall-status').textContent = '✨ 点击下方麦克风继续说话';
        };

        rec.onend = () => {
            stopSpeechRecognition();
        };

        return rec;
    }

    function stopSpeechRecognition() {
        isListening = false;
        const micBtn = document.getElementById('jj-btn-mic');
        const micLabel = document.getElementById('jj-mic-label');
        if (micBtn) micBtn.classList.remove('jj-listening');
        if (micLabel) micLabel.textContent = '点击说话';
        if (recognition) {
            try { recognition.stop(); } catch (e) {}
        }
    }

    document.getElementById('jj-btn-mic').addEventListener('click', () => {
        if (isListening) {
            stopSpeechRecognition();
            return;
        }
        if (!recognition) {
            recognition = initSpeechRecognition();
        }
        if (recognition) {
            try {
                recognition.start();
            } catch (e) {
                stopSpeechRecognition();
            }
        }
    });

    // ==================== 7. 打开/关闭与拖拽交互 ====================
    floatBtn.addEventListener('click', () => {
        const isShown = phoneWrapper.classList.toggle('jj-show');
        if (isShown && !isCalling) {
            syncFromSillyTavern();
        }
    });

    document.getElementById('jj-close-phone-btn').addEventListener('click', () => {
        phoneWrapper.classList.remove('jj-show');
    });

    // 让小手机顶部状态栏可以自由拖拽位置
    const dragHandle = document.getElementById('jj-phone-drag-handle');
    let isDragging = false, startX, startY, initialRight, initialBottom;

    dragHandle.addEventListener('mousedown', (e) => {
        isDragging = true;
        startX = e.clientX;
        startY = e.clientY;
        const rect = phoneWrapper.getBoundingClientRect();
        initialRight = window.innerWidth - rect.right;
        initialBottom = window.innerHeight - rect.bottom;
        document.body.style.userSelect = 'none';
    });

    window.addEventListener('mousemove', (e) => {
        if (!isDragging) return;
        const dx = startX - e.clientX;
        const dy = startY - e.clientY;
        phoneWrapper.style.right = `${Math.max(10, initialRight + dx)}px`;
        phoneWrapper.style.bottom = `${Math.max(10, initialBottom + dy)}px`;
    });

    window.addEventListener('mouseup', () => {
        if (isDragging) {
            isDragging = false;
            document.body.style.userSelect = '';
        }
    });

    // 等待酒馆加载完成后绑定事件
    const initTimer = setInterval(() => {
        if (window.SillyTavern && window.SillyTavern.getContext) {
            clearInterval(initTimer);
            setupTavernMessageListener();
            syncFromSillyTavern();
        }
    }, 1000);

})();