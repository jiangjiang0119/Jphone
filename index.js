(function () {
    'use strict';

    // 防止重复初始化界面
    if (document.getElementById('jj-sweet-phone-wrapper')) return;

    // ==================== 1. 注入低饱和奶油蜜桃浅色系 CSS ====================
    const style = document.createElement('style');
    style.innerHTML = `
        :root {
            --jj-bg-milk: #FFFDF9;
            --jj-bg-blush: #FDF2F0;
            --jj-card-bg: #FFFFFF;
            --jj-border-soft: #F5E1DA;
            --jj-text-main: #8C5E64;      /* 温柔干枯玫瑰色，无黑无棕 */
            --jj-text-muted: #B88E92;     /* 浅粉雾灰 */
            --jj-peach-main: #F4A7A3;     /* 低饱和蜜桃粉 */
            --jj-peach-hover: #EE9590;
            --jj-apricot: #F7C59F;        /* 奶油杏橘色 */
            --jj-sakura-light: #FADAD8;   /* 浅樱花粉 */
            --jj-hangup-red: #E88B8C;     /* 柔和珊瑚红 */
            --jj-shadow: rgba(232, 165, 152, 0.28);
        }

        /* 魔法棒菜单里的专属按钮样式微调 */
        #jj-wand-phone-item {
            cursor: pointer;
            transition: background 0.2s;
        }
        #jj-wand-phone-item:hover {
            background: rgba(244, 167, 163, 0.15) !important;
        }

        /* 小手机主体外框（手机端完美居中，最高图层防遮挡） */
        #jj-sweet-phone-wrapper {
            position: fixed;
            top: 50%;
            left: 50%;
            transform: translate(-50%, -50%);
            width: 325px;
            max-width: 90vw;
            height: 580px;
            max-height: 82vh;
            background: var(--jj-bg-milk);
            border-radius: 36px;
            border: 6px solid var(--jj-border-soft);
            box-shadow: 0 16px 45px var(--jj-shadow), 0 0 0 100vmax rgba(255, 249, 245, 0.35);
            z-index: 2147483640 !important;
            display: none;
            flex-direction: column;
            overflow: hidden;
            font-family: "PingFang SC", "Microsoft YaHei", sans-serif;
            color: var(--jj-text-main);
        }
        #jj-sweet-phone-wrapper.jj-show {
            display: flex !important;
            animation: jjPopCenter 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
        }
        @keyframes jjPopCenter {
            from { opacity: 0; transform: translate(-50%, -46%) scale(0.94); }
            to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        }

        /* 顶部状态栏 */
        .jj-phone-statusbar {
            height: 38px;
            padding: 0 20px;
            display: flex;
            align-items: center;
            justify-content: space-between;
            background: var(--jj-bg-milk);
            font-size: 12px;
            font-weight: 600;
            color: var(--jj-text-muted);
            user-select: none;
            border-bottom: 1px dashed var(--jj-border-soft);
            flex-shrink: 0;
        }
        .jj-notch {
            width: 68px;
            height: 14px;
            background: var(--jj-sakura-light);
            border-radius: 10px;
        }
        .jj-close-phone {
            cursor: pointer;
            font-size: 16px;
            color: var(--jj-text-muted);
            padding: 2px 8px;
            border-radius: 10px;
            background: var(--jj-bg-blush);
        }
        .jj-close-phone:hover {
            color: var(--jj-text-main);
            background: var(--jj-sakura-light);
        }

        /* 屏幕内容通用容器 */
        .jj-screen {
            flex: 1;
            background: linear-gradient(180deg, var(--jj-bg-milk) 0%, var(--jj-bg-blush) 100%);
            padding: 14px 16px;
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

        /* 标题区 */
        .jj-header-title {
            text-align: center;
            margin-bottom: 2px;
        }
        .jj-header-title h3 {
            margin: 0;
            font-size: 16px;
            color: var(--jj-text-main);
            font-weight: 700;
        }
        .jj-header-title p {
            margin: 2px 0 0;
            font-size: 11px;
            color: var(--jj-text-muted);
        }

        /* 表单卡片 */
        .jj-form-card {
            background: var(--jj-card-bg);
            border-radius: 16px;
            padding: 10px 12px;
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
            padding: 3px 2px;
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
            padding: 12px;
            font-size: 15px;
            font-weight: 700;
            cursor: pointer;
            box-shadow: 0 6px 16px rgba(244, 167, 163, 0.35);
            display: flex;
            align-items: center;
            justify-content: center;
            gap: 8px;
            flex-shrink: 0;
        }

        /* ==================== 通话中界面 ==================== */
        #jj-screen-incall {
            display: none;
            align-items: center;
            justify-content: space-between;
            text-align: center;
            padding: 20px 16px 16px;
        }
        .jj-caller-info {
            display: flex;
            flex-direction: column;
            align-items: center;
            gap: 6px;
            width: 100%;
        }
        .jj-avatar-ring {
            width: 88px;
            height: 88px;
            border-radius: 50%;
            padding: 5px;
            background: linear-gradient(135deg, var(--jj-sakura-light), var(--jj-apricot));
            box-shadow: 0 6px 20px rgba(244, 167, 163, 0.28);
            animation: jjPulse 2.4s infinite ease-in-out;
        }
        @keyframes jjPulse {
            0%, 100% { transform: scale(1); }
            50% { transform: scale(1.05); }
        }
        .jj-avatar-ring img {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            object-fit: cover;
            background: var(--jj-bg-milk);
        }
        .jj-caller-name {
            font-size: 17px;
            font-weight: 700;
            color: var(--jj-text-main);
            margin-top: 2px;
        }
        .jj-call-timer {
            font-size: 12px;
            color: var(--jj-text-muted);
            font-family: monospace;
            background: rgba(255, 255, 255, 0.75);
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
            height: 140px;
            background: rgba(255, 255, 255, 0.85);
            border: 1px solid var(--jj-border-soft);
            border-radius: 18px;
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
            border-radius: 14px 14px 3px 14px;
            max-width: 85%;
        }
        .jj-sub-item-char {
            align-self: flex-start;
            background: var(--jj-bg-milk);
            border: 1px solid var(--jj-border-soft);
            color: var(--jj-text-main);
            padding: 6px 10px;
            border-radius: 14px 14px 14px 3px;
            max-width: 88%;
        }

        /* 键盘/语音输入栏（常驻显示，方便直接用手机自带语音输入或打字） */
        .jj-manual-input-row {
            width: 100%;
            display: flex;
            gap: 6px;
        }
        .jj-mini-send-btn {
            background: var(--jj-peach-main);
            color: #FFF;
            border: none;
            border-radius: 12px;
            padding: 0 14px;
            font-size: 12.5px;
            font-weight: 600;
            cursor: pointer;
            flex-shrink: 0;
        }

        /* 底部通话控制栏 */
        .jj-call-controls {
            width: 100%;
            display: flex;
            align-items: center;
            justify-content: space-around;
            padding-top: 4px;
        }
        .jj-ctrl-btn {
            width: 48px;
            height: 48px;
            border-radius: 50%;
            border: 1px solid var(--jj-border-soft);
            background: #FFFFFF;
            color: var(--jj-text-main);
            display: flex;
            align-items: center;
            justify-content: center;
            cursor: pointer;
            box-shadow: 0 4px 12px var(--jj-shadow);
            font-size: 18px;
        }
        .jj-mic-btn {
            width: 62px;
            height: 62px;
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

    // ==================== 2. 构建小手机界面 ====================
    const phoneWrapper = document.createElement('div');
    phoneWrapper.id = 'jj-sweet-phone-wrapper';
    phoneWrapper.innerHTML = `
        <div class="jj-phone-statusbar">
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
                    <span>✨ 纯口语电话模式 (只说对白)</span>
                    <input type="checkbox" class="jj-checkbox" id="jj-check-oral-mode" checked />
                </div>
                <div class="jj-toggle-row">
                    <span>🔊 自动播放酒馆 TTS 语音</span>
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

            <div class="jj-manual-input-row">
                <input type="text" class="jj-input" id="jj-manual-text" placeholder="可点麦克风或用手机键盘语音输入..." />
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
                    <button class="jj-ctrl-btn jj-hangup-btn" id="jj-btn-hangup" title="挂断电话">📴</button>
                    <span class="jj-ctrl-label">挂断电话</span>
                </div>
            </div>
        </div>
    `;
    document.body.appendChild(phoneWrapper);

    // ==================== 3. 把入口放进底下「🪄魔法棒」菜单最下面 ====================
    function openSweetPhone() {
        phoneWrapper.classList.add('jj-show');
        if (!isCalling) {
            syncFromSillyTavern();
        }
    }

    function injectIntoMagicWandMenu() {
        const extensionsMenu = document.getElementById('extensionsMenu');
        if (extensionsMenu && !document.getElementById('jj-wand-phone-item')) {
            const wandItem = document.createElement('div');
            wandItem.id = 'jj-wand-phone-item';
            wandItem.className = 'list-group-item flex-container flexGap5 interactable';
            wandItem.setAttribute('tabindex', '0');
            wandItem.innerHTML = `
                <i class="fa-solid fa-phone-volume" style="color: #F4A7A3;"></i>
                <span>🍑 奶油蜜桃小手机</span>
            `;
            wandItem.addEventListener('click', () => {
                openSweetPhone();
            });
            extensionsMenu.appendChild(wandItem);
        }
    }

    // 定时检查确保魔法棒菜单最底下一直有小手机入口
    setInterval(injectIntoMagicWandMenu, 1000);
    injectIntoMagicWandMenu();

    // ==================== 4. 状态与同步逻辑 ====================
    let isCalling = false;
    let callSeconds = 0;
    let timerInterval = null;
    let recognition = null;
    let isListening = false;
    let lastRenderedMesId = -1;

    function updateClock() {
        const now = new Date();
        const hh = String(now.getHours()).padStart(2, '0');
        const mm = String(now.getMinutes()).padStart(2, '0');
        const el = document.getElementById('jj-status-time');
        if (el) el.textContent = `${hh}:${mm}`;
    }
    setInterval(updateClock, 10000);
    updateClock();

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

    function syncFromSillyTavern() {
        const ctx = window.SillyTavern?.getContext?.() || {};

        // 1. 角色列表
        const charSelect = document.getElementById('jj-select-char');
        charSelect.innerHTML = '';
        if (ctx.characters && Array.isArray(ctx.characters) && ctx.characters.length > 0) {
            ctx.characters.forEach((ch, idx) => {
                const opt = document.createElement('option');
                opt.value = idx;
                opt.textContent = ch.name;
                if (String(idx) === String(ctx.characterId)) opt.selected = true;
                charSelect.appendChild(opt);
            });
        } else {
            charSelect.innerHTML = `<option value="">当前聊天角色</option>`;
        }

        // 2. 预设列表
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

        // 3. 用户设定 (Persona)
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

        // 4. 世界书 (World Info)
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

    // ==================== 5. 电话拨通与挂断 ====================
    function formatTime(sec) {
        const m = String(Math.floor(sec / 60)).padStart(2, '0');
        const s = String(sec % 60).padStart(2, '0');
        return `${m}:${s}`;
    }

    async function runSlashCommand(cmd) {
        const ctx = window.SillyTavern?.getContext?.();
        if (ctx && typeof ctx.executeSlashCommandsWithOptions === 'function') {
            await ctx.executeSlashCommandsWithOptions(cmd);
        } else if (ctx && typeof ctx.executeSlashCommands === 'function') {
            await ctx.executeSlashCommands(cmd);
        }
    }

    document.getElementById('jj-start-call-btn').addEventListener('click', async () => {
        isCalling = true;
        callSeconds = 0;

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

        if (document.getElementById('jj-check-auto-tts').checked) {
            const ttsCheckbox = document.getElementById('tts_enabled');
            if (ttsCheckbox && !ttsCheckbox.checked) {
                ttsCheckbox.click();
            }
        }

        const scenario = document.getElementById('jj-input-scenario').value.trim();
        const oralMode = document.getElementById('jj-check-oral-mode').checked;
        if (oralMode || scenario) {
            let promptText = `[系统提示：当前正在与用户进行实时语音电话通话。`;
            if (scenario) promptText += `当前通话情境：${scenario}。`;
            if (oralMode) promptText += `请使用自然、亲密的口语回答，只输出你在电话里说出口的话，不要输出任何动作、神态、心理描写或括号内容，以便语音TTS直接朗读。`;
            promptText += `]`;
            await runSlashCommand(`/inject id=jj_phone_call position=chat depth=0 ${promptText}`);
        }

        document.getElementById('jj-screen-setup').style.display = 'none';
        document.getElementById('jj-screen-incall').style.display = 'flex';

        clearInterval(timerInterval);
        timerInterval = setInterval(() => {
            callSeconds++;
            document.getElementById('jj-incall-timer').textContent = formatTime(callSeconds);
        }, 1000);
    });

    document.getElementById('jj-btn-hangup').addEventListener('click', async () => {
        isCalling = false;
        clearInterval(timerInterval);
        stopSpeechRecognition();
        await runSlashCommand(`/flushinject jj_phone_call`);

        document.getElementById('jj-screen-incall').style.display = 'none';
        document.getElementById('jj-screen-setup').style.display = 'flex';
    });

    document.getElementById('jj-close-phone-btn').addEventListener('click', () => {
        phoneWrapper.classList.remove('jj-show');
    });

    // ==================== 6. 发送消息与联动酒馆 TTS ====================
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

        document.getElementById('jj-incall-status').textContent = '💭 对方正在倾听并回应...';

        const textarea = document.getElementById('send_textarea');
        const sendBtn = document.getElementById('send_but');
        if (textarea && sendBtn) {
            textarea.value = cleanText;
            textarea.dispatchEvent(new Event('input', { bubbles: true }));
            sendBtn.click();
        }
    }

    function triggerTavernTTSOnLastMessage() {
        const aiMessages = document.querySelectorAll('#chat .mes[is_user="false"]');
        if (aiMessages.length === 0) return;
        const lastMes = aiMessages[aiMessages.length - 1];
        const narrateBtn = lastMes.querySelector('.mes_narrate');
        if (narrateBtn) narrateBtn.click();
    }

    document.getElementById('jj-btn-replay-tts').addEventListener('click', () => {
        triggerTavernTTSOnLastMessage();
        document.getElementById('jj-incall-status').textContent = '🔊 正在为你重播语音...';
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
            if (document.getElementById('jj-check-auto-tts').checked) {
                const autoGenCheckbox = document.getElementById('tts_auto_generation');
                if (autoGenCheckbox && !autoGenCheckbox.checked) {
                    triggerTavernTTSOnLastMessage();
                }
            }
        }, 300);
    }

    // ==================== 7. 语音识别 (Web Speech API) ====================
    function initSpeechRecognition() {
        const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
        if (!SpeechRecognition) {
            alert('宝，当前浏览器不支持直接点击麦克风识别，你可以直接点上面的输入框，用手机键盘自带的麦克风语音输入哦~');
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

        rec.onerror = () => {
            stopSpeechRecognition();
            document.getElementById('jj-incall-status').textContent = '✨ 可点麦克风或用输入框语音输入';
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
            try { recognition.start(); } catch (e) { stopSpeechRecognition(); }
        }
    });

    const initTimer = setInterval(() => {
        if (window.SillyTavern && window.SillyTavern.getContext) {
            clearInterval(initTimer);
            setupTavernMessageListener();
        }
    }, 1000);

})();