import { extension_settings } from "../../../extensions.js";
import { saveSettingsDebounced } from "../../../../script.js";

const extName = "J-phone";

const DEFAULT_PRESET = `【小手机全局指令】
1. 严禁脱离角色「池衿宴」的人设、性格、说话语气及当前所处剧情阶段。
2. 严禁输出任何主线正文的状态栏代码、HTML标签或多余解释。
3. 请结合读取到的【角色设定】、【绛绛的用户设定】、【选中的世界书条目】以及【最新未隐藏的聊天记录/总结】，贴合当下情境生成极具活人感与真实网感的手机软件内容。`;

const defaultSettings = {
    showSendBtn: true,
    customImages: {},
    boundCharAvatar: "",
    readChar: true,
    readUser: true,
    readChat: true,
    apiMode: "st",
    apiUrl: "",
    apiKey: "",
    apiModel: "",
    checkedWi: {},
    presetText: DEFAULT_PRESET,
    statusColor: "#000000",
    appnameColor: "#4A5D29"
};

const LIME_PHONE_SVG = `<svg width="34" height="34" viewBox="11 3 42 58" fill="none" xmlns="http://www.w3.org/2000/svg"><defs><linearGradient id="limeScreen2" x1="15" y1="10" x2="49" y2="58" gradientUnits="userSpaceOnUse"><stop offset="0%" stop-color="#FEF1BD"/><stop offset="100%" stop-color="#E1E9A5"/></linearGradient></defs><rect x="15" y="10" width="34" height="48" rx="8.5" fill="url(#limeScreen2)" stroke="#8AA85B" stroke-width="3"/><rect x="20" y="17" width="24" height="12" rx="4" fill="#C1DB93" fill-opacity="0.6"/><path d="M32 26.5C32 26.5 28 23.8 28 21.2C28 19.9 29 19 30.2 19C31 19 31.7 19.4 32 20.1C32.3 19.4 33 19 33.8 19C35 19 36 19.9 36 21.2C36 23.8 32 26.5 32 26.5Z" fill="#FFD557"/><rect x="20" y="32" width="10" height="10" rx="3" fill="#C1DB93" stroke="#8AA85B" stroke-width="1.2"/><rect x="34" y="32" width="10" height="10" rx="3" fill="#FFD557" stroke="#D9B036" stroke-width="1.2"/><rect x="20" y="45" width="10" height="6" rx="2.5" fill="#FFFFFF" opacity="0.9"/><rect x="34" y="45" width="10" height="6" rx="2.5" fill="#C1DB93" opacity="0.85"/><circle cx="32" cy="54.5" r="1.8" fill="#7B9651"/><path d="M32 10.5C26.5 4 18.5 5 19.5 11C20.5 15.5 28 13 32 10.5Z" fill="#FFD557" stroke="#8AA85B" stroke-width="1.8" stroke-linejoin="round"/><path d="M32 10.5C37.5 4 45.5 5 44.5 11C43.5 15.5 36 13 32 10.5Z" fill="#FFD557" stroke="#8AA85B" stroke-width="1.8" stroke-linejoin="round"/><path d="M29.5 11.5L25.5 17M34.5 11.5L38.5 17" stroke="#FFD557" stroke-width="2.4" stroke-linecap="round"/><circle cx="32" cy="10.5" r="2.8" fill="#FEF1BD" stroke="#8AA85B" stroke-width="1.8"/></svg>`;

function compressImage(file, maxSize, callback) {
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement("canvas");
            let w = img.width, h = img.height;
            if (w > maxSize || h > maxSize) {
                if (w > h) { h = Math.round(h * maxSize / w); w = maxSize; }
                else { w = Math.round(w * maxSize / h); h = maxSize; }
            }
            canvas.width = w; canvas.height = h;
            canvas.getContext("2d").drawImage(img, 0, 0, w, h);
            callback(canvas.toDataURL("image/webp", 0.82));
        };
        img.src = e.target.result;
    };
    reader.readAsDataURL(file);
}

function applySavedImages() {
    const imgs = extension_settings[extName].customImages || {};
    $(".jp-file-in").each(function () {
        const key = $(this).data("key");
        const targetId = $(this).data("target");
        const clearInner = $(this).data("clear");
        const el = $(`#${targetId}`);
        if (imgs[key]) {
            el.css("background-image", `url('${imgs[key]}')`);
            if (clearInner) el.children().hide();
        }
    });
    updateAutoStatusTimeColor();
}

/* 根据小手机壁纸顶部区域亮度，自动切换整行状态栏黑/白。
   时间、信号、Wi-Fi、电池统一继承状态栏颜色；灵动岛保持原样。 */
function updateAutoStatusTimeColor() {
    const wallpaper = (extension_settings[extName].customImages || {}).wallpaper;
    const statusbar = document.querySelector("#jp_screen_inner .jp-statusbar");
    const screen = document.getElementById("jp_screen_inner");
    if (!statusbar || !screen) return;

    const applyColor = (color) => {
        statusbar.style.color = color;
    };

    if (!wallpaper) {
        applyColor("#000000");
        return;
    }

    const img = new Image();
    img.onload = () => {
        try {
            const width = screen.clientWidth || 390;
            const height = screen.clientHeight || 844;
            const scale = Math.max(width / img.naturalWidth, height / img.naturalHeight);
            const scaledWidth = img.naturalWidth * scale;
            const scaledHeight = img.naturalHeight * scale;
            const offsetX = (width - scaledWidth) / 2;
            const offsetY = (height - scaledHeight) / 2;

            const sampleWidth = 48;
            const sampleHeight = 8;
            const canvas = document.createElement("canvas");
            canvas.width = sampleWidth;
            canvas.height = sampleHeight;
            const ctx = canvas.getContext("2d", { willReadFrequently: true });
            ctx.drawImage(
                img,
                -offsetX / scale,
                -offsetY / scale,
                width / scale,
                height / scale
            );
            const pixels = ctx.getImageData(0, 0, sampleWidth, sampleHeight).data;
            let luminanceTotal = 0;
            let count = 0;
            for (let i = 0; i < pixels.length; i += 4) {
                const alpha = pixels[i + 3] / 255;
                const red = pixels[i] * alpha + 255 * (1 - alpha);
                const green = pixels[i + 1] * alpha + 255 * (1 - alpha);
                const blue = pixels[i + 2] * alpha + 255 * (1 - alpha);
                luminanceTotal += 0.2126 * red + 0.7152 * green + 0.0722 * blue;
                count++;
            }
            const averageLuminance = count ? luminanceTotal / count : 255;
            applyColor(averageLuminance >= 145 ? "#000000" : "#FFFFFF");
        } catch (error) {
            // 无法读取图片像素时，保持当前状态栏颜色。
        }
    };
    img.onerror = () => applyColor("#000000");
    img.src = wallpaper;
}

// 🎨 应用状态栏与软件名颜色
function applyCustomColors() {
    const s = extension_settings[extName];
    const statusCol = s.statusColor || "#000000";
    const appnameCol = s.appnameColor || "#4A5D29";

    const screen = $("#jp_screen_inner");
    screen.css("--jp-status-color", statusCol);
    screen.css("--jp-appname-color", appnameCol);

    $("#jp_status_color_picker").val(statusCol);
    $("#jp_status_color_hex").val(statusCol);
    $("#jp_appname_color_picker").val(appnameCol);
    $("#jp_appname_color_hex").val(appnameCol);
}

function updateClock() {
    const now = new Date();
    const timeStr = `${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
    const timeWithSec = `${timeStr}:${String(now.getSeconds()).padStart(2, "0")}`;
    const days = ["星期日","星期一","星期二","星期三","星期四","星期五","星期六"];
    
    $("#jp_top_clock, #jp_big_clock").text(timeStr);
    $("#jp_date_text").text(`${now.getMonth() + 1}月${now.getDate()}日 ${days[now.getDay()]} · 宜与阿宴贴贴 ✨`);

    // 自动计算并填入相遇天数与盖章天数
    const meetDays = Math.floor((now - new Date("2025/01/19")) / 86400000) + 1;
    const marryDays = Math.floor((now - new Date("2025/02/09")) / 86400000) + 1;
    $("#jp_anniv_meet").text(`Day ${meetDays}`);
    $("#jp_anniv_marry").text(`Day ${marryDays}`);

    // 下层胶囊：实时跳秒问候
    const h = now.getHours();
    const greet = (h >= 5 && h < 12) ? "Good Morning ✨" : (h >= 12 && h < 18) ? "Good Afternoon ✨" : "Good Night ✨";
    $("#jp_pill_live_time").text(`It's ${timeWithSec} Now, ${greet}`);
}
// 开启每秒刷新，让胶囊秒表平稳跳秒
if (!window.jpClockInterval) window.jpClockInterval = setInterval(updateClock, 1000);

function loadCharacterList() {
    const ctx = SillyTavern.getContext();
    const chars = ctx.characters || [];
    const select = $("#jp_char_select");
    select.empty();

    let savedAvatar = extension_settings[extName].boundCharAvatar;
    if (!savedAvatar) {
        const cjy = chars.find(c => c.name && c.name.includes("池衿宴"));
        if (cjy) {
            savedAvatar = cjy.avatar;
            extension_settings[extName].boundCharAvatar = savedAvatar;
            saveSettingsDebounced();
        } else if (ctx.characterId !== undefined && chars[ctx.characterId]) {
            savedAvatar = chars[ctx.characterId].avatar;
        }
    }

    chars.forEach((c) => {
        const opt = $(`<option value="${c.avatar}">${c.name}</option>`);
        if (c.avatar === savedAvatar) opt.prop("selected", true);
        select.append(opt);
    });
}

async function loadWorldBookNames() {
    const select = $("#jp_wi_book_select");
    const currentVal = select.val();
    select.empty().append(`<option value="">-- 请选择世界书 --</option>`);

    let names = [];
    try {
        const wiMod = await import("../../../world-info.js");
        if (Array.isArray(wiMod.world_names)) names = wiMod.world_names;
    } catch (e) {}

    if (!names.length) {
        $("#world_editor_select option, #character_world option").each(function () {
            const t = $(this).text().trim();
            if (t && !t.startsWith("---") && !names.includes(t)) names.push(t);
        });
    }

    names.forEach(name => {
        const opt = $(`<option></option>`).val(name).text(name);
        if (name === currentVal) opt.prop("selected", true);
        select.append(opt);
    });
    updateWiCountTip();
}

function updateWiCountTip() {
    const checkedWi = extension_settings[extName].checkedWi || {};
    const keys = Object.keys(checkedWi);
    $("#jp_wi_count_tip").text(`已勾选 ${keys.length} 条 · 跨书永久保存`);
    $("#jp_wi_checked_title").text(`已勾选条目（共 ${keys.length} 条）`);

    const summaryBox = $("#jp_wi_selected_summary");
    summaryBox.empty();

    if (!keys.length) {
        summaryBox.html('<div class="jp-wi-empty">暂未勾选任何世界书条目</div>');
        return;
    }

    keys.forEach((keyId) => {
        const item = checkedWi[keyId];
        if (!item) return;

        const row = $('<label class="jp-wi-row checked"></label>');
        const book = $('<span class="jp-wi-book-prefix"></span>').text(`《${item.book || "未命名世界书"}》`);
        const title = $('<span class="jp-wi-name"></span>').text(item.title || "未命名条目");
        const chk = $('<input type="checkbox" class="jp-wi-chk" checked>');
        chk.on("change", function () {
            delete extension_settings[extName].checkedWi[keyId];
            saveSettingsDebounced();
            $("#jp_wi_entries_box .jp-wi-entry-chk").filter(function () {
                return $(this).attr("data-keyid") === keyId;
            }).prop("checked", false);
            updateWiCountTip();
        });

        row.append(book, title, chk);
        summaryBox.append(row);
    });
}

async function loadBookEntries(bookName) {
    const box = $("#jp_wi_entries_box");
    updateWiCountTip();

    if (!bookName) {
        $("#jp_wi_all_title").text("当前书目全部条目（未载入）");
        box.html('<div class="jp-wi-empty">请先载入并选择一本世界书</div>');
        return;
    }

    $("#jp_wi_all_title").text(`《${bookName}》全部条目（读取中…）`);
    box.html('<div class="jp-wi-empty">正在读取世界书条目…</div>');

    try {
        let data = null;
        try {
            const wiMod = await import("../../../world-info.js");
            if (wiMod.loadWorldInfo) data = await wiMod.loadWorldInfo(bookName);
        } catch (e) {}

        if (!data) {
            const ctx = SillyTavern.getContext();
            const res = await fetch("/api/worldinfo/get", {
                method: "POST",
                headers: ctx.getRequestHeaders(),
                body: JSON.stringify({ name: bookName })
            });
            data = await res.json();
        }

        const entries = data && data.entries ? Object.values(data.entries) : [];
        $("#jp_wi_all_title").text(`《${bookName}》全部条目（${entries.length}）`);

        if (!entries.length) {
            box.html('<div class="jp-wi-empty">这本世界书里还没有条目</div>');
            return;
        }

        box.empty().css({ "max-height": "175px", "overflow-y": "auto" });
        const checkedWi = extension_settings[extName].checkedWi || {};

        entries.forEach((entry, idx) => {
            const uid = entry.uid !== undefined ? entry.uid : idx;
            const keyId = `${bookName}::${uid}`;
            let title = (entry.comment || "").trim();
            if (!title && Array.isArray(entry.key) && entry.key.length > 0) {
                title = entry.key.join(", ").trim();
            }
            if (!title) title = `词条 #${idx + 1}`;

            const content = entry.content || "";
            const preview = content.replace(/\s+/g, " ").slice(0, 48);
            const isChecked = Boolean(checkedWi[keyId]);

            const row = $('<label class="jp-wi-row"></label>');
            const infoBox = $('<div class="jp-wi-row-info"></div>');
            const titleEl = $('<div class="jp-wi-row-title"></div>').text(`${idx + 1}. ${title}`);
            const descEl = $('<div class="jp-wi-row-desc"></div>').text(preview || "(空内容)");
            const chk = $('<input type="checkbox" class="jp-wi-chk jp-wi-entry-chk">')
                .attr("data-uid", uid)
                .attr("data-keyid", keyId)
                .prop("checked", isChecked);

            infoBox.append(titleEl, descEl);
            row.append(infoBox, chk);

            chk.on("change", function () {
                extension_settings[extName].checkedWi = extension_settings[extName].checkedWi || {};
                if ($(this).prop("checked")) {
                    extension_settings[extName].checkedWi[keyId] = { book: bookName, uid, title, content };
                    row.addClass("checked");
                } else {
                    delete extension_settings[extName].checkedWi[keyId];
                    row.removeClass("checked");
                }
                saveSettingsDebounced();
                updateWiCountTip();
            });
            if (isChecked) row.addClass("checked");
            box.append(row);
        });
    } catch (err) {
        $("#jp_wi_all_title").text(`《${bookName}》条目读取失败`);
        box.empty().append($('<div class="jp-wi-empty jp-wi-error"></div>').text(`读取世界书失败：${err.message || err}`));
    }
}


function cleanMesText(raw) {
    if (!raw) return "";
    return raw
        .replace(/<style[\s\S]*?<\/style>/gi, "")
        .replace(/<script[\s\S]*?<\/script>/gi, "")
        .replace(/\[STATUS_START\][\s\S]*?\[STATUS_END\]/gi, "")
        .replace(/<[^>]+>/g, "")
        .trim();
}

export function collectPhoneContext() {
    const ctx = SillyTavern.getContext();
    const s = extension_settings[extName];
    const chars = ctx.characters || [];

    let charObj = chars.find(c => c.avatar === s.boundCharAvatar);
    if (!charObj && ctx.characterId !== undefined) charObj = chars[ctx.characterId];

    const charName = charObj ? charObj.name : "池衿宴";
    const charDesc = (s.readChar && charObj)
        ? [charObj.description, charObj.personality, charObj.scenario].filter(Boolean).join("\n")
        : "";

    const userName = ctx.name1 || "绛绛";
    const userDesc = (s.readUser && ctx.powerUserSettings)
        ? (ctx.powerUserSettings.persona_description || "")
        : "";

    const wiList = Object.values(s.checkedWi || {});
    const wiText = wiList.map(item => `【${item.title}】\n${item.content}`).join("\n\n");

    let chatList = [];
    if (s.readChat && Array.isArray(ctx.chat)) {
        chatList = ctx.chat
            .filter(m => !m.is_system)
            .map(m => `${m.name || (m.is_user ? userName : charName)}: ${cleanMesText(m.mes)}`)
            .filter(line => line.split(": ")[1]);
    }

    return {
        charName, charDesc,
        userName, userDesc,
        wiCount: wiList.length, wiText,
        chatCount: chatList.length, chatText: chatList.join("\n"),
        presetText: s.presetText || DEFAULT_PRESET
    };
}

export async function generatePhoneContent(taskPrompt) {
    const s = extension_settings[extName];
    const info = collectPhoneContext();

    const fullPrompt = [
        info.presetText,
        info.charDesc ? `【角色设定（${info.charName}）】\n${info.charDesc}` : "",
        info.userDesc ? `【用户设定（${info.userName}）】\n${info.userDesc}` : "",
        info.wiText ? `【世界书设定】\n${info.wiText}` : "",
        info.chatText ? `【当前未隐藏剧情与总结记录】\n${info.chatText}` : "",
        `【当前生成任务】\n${taskPrompt}`
    ].filter(Boolean).join("\n\n");

    if (s.apiMode === "custom") {
        if (!s.apiUrl || !s.apiKey || !s.apiModel) {
            throw new Error("请先在设置中填写完整的自定义 API 地址、密钥并选择模型！");
        }
        const url = s.apiUrl.replace(/\/+$/, "") + "/chat/completions";
        const res = await fetch(url, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${s.apiKey}`
            },
            body: JSON.stringify({
                model: s.apiModel,
                messages: [{ role: "user", content: fullPrompt }],
                temperature: 0.85
            })
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error?.message || "自定义 API 请求失败");
        return data.choices?.[0]?.message?.content || "";
    } else {
        const ctx = SillyTavern.getContext();
        if (typeof ctx.generateQuietPrompt === "function") {
            return await ctx.generateQuietPrompt(fullPrompt, false, false);
        } else if (typeof ctx.generateRaw === "function") {
            return await ctx.generateRaw({ prompt: fullPrompt, quietToLoud: false });
        }
        throw new Error("未找到酒馆主 API 生成接口");
    }
}

/* App 页面打开时，根据顶部实际内容背景切换黑/白状态栏。
   桌面仍由壁纸顶部亮度决定；灵动岛保持黑色。 */
function updateStatusColorForPage(pageId) {
    if (pageId === "jp_p_home") {
        updateAutoStatusTimeColor();
        return;
    }

    const statusbar = document.querySelector("#jp_screen_inner .jp-statusbar");
    const page = document.getElementById(pageId);
    if (!statusbar || !page) return;

    const screen = document.getElementById("jp_screen_inner");
    const rect = page.getBoundingClientRect();
    const x = Math.max(1, Math.min(window.innerWidth - 2, rect.left + rect.width / 2));
    const y = Math.max(1, Math.min(window.innerHeight - 2, rect.top + 2));
    let el = document.elementFromPoint(x, y);
    let color = null;

    while (el && page.contains(el)) {
        const bg = window.getComputedStyle(el).backgroundColor;
        const match = bg && bg.match(/rgba?\(([^)]+)\)/);
        if (match) {
            const values = match[1].split(",").map(v => parseFloat(v.trim()));
            const alpha = values.length > 3 ? values[3] : 1;
            if (alpha > 0.05) {
                const base = color || [255, 255, 255];
                color = [
                    values[0] * alpha + base[0] * (1 - alpha),
                    values[1] * alpha + base[1] * (1 - alpha),
                    values[2] * alpha + base[2] * (1 - alpha)
                ];
                break;
            }
        }
        el = el.parentElement;
    }

    if (!color) {
        const bg = window.getComputedStyle(page).backgroundColor;
        const match = bg && bg.match(/rgba?\(([^)]+)\)/);
        if (match) color = match[1].split(",").slice(0, 3).map(v => parseFloat(v.trim()));
    }

    if (!color || color.some(v => !Number.isFinite(v))) {
        statusbar.style.color = "#000000";
        return;
    }

    const luminance = 0.2126 * color[0] + 0.7152 * color[1] + 0.0722 * color[2];
    statusbar.style.color = luminance >= 145 ? "#000000" : "#FFFFFF";
}

function switchPage(pageId) {
    $(".jp-page").removeClass("active");
    $(`#${pageId}`).addClass("active");
    if (pageId === "jp_p_set") {
        loadCharacterList();
        updateWiCountTip();
        applyCustomColors();
    }
    requestAnimationFrame(() => updateStatusColorForPage(pageId));
}

function togglePhoneModal(show) {
    const overlay = $("#j_phone_overlay");
    if (show === undefined) show = overlay.hasClass("j-phone-hidden");
    if (show) {
        updateClock();
        applySavedImages();
        applyCustomColors();
        overlay.removeClass("j-phone-hidden");
    } else {
        overlay.addClass("j-phone-hidden");
    }
}

function updateSendButton() {
    $("#lime_phone_entry_btn").remove();
    if (extension_settings[extName].showSendBtn) {
        const btn = $(`<div id="lime_phone_entry_btn" class="interactable" title="打开绛の小手机">${LIME_PHONE_SVG}</div>`);
        btn.on("click", () => togglePhoneModal());
        $("#rightSendForm").prepend(btn);
    }
}

jQuery(async () => {
    extension_settings[extName] = Object.assign({}, defaultSettings, extension_settings[extName]);
    const s = extension_settings[extName];
    s.customImages = s.customImages || {};
    s.checkedWi = s.checkedWi || {};
    s.statusColor = s.statusColor || "#000000";
    s.appnameColor = s.appnameColor || "#4A5D29";

    const v = Date.now();
    const cssText = await (await fetch(new URL(`./style.css?v=${v}`, import.meta.url), { cache: "no-store" })).text();
    $("#j_phone_fresh_css").remove();
    $("head").append(`<style id="j_phone_fresh_css">${cssText}</style>`);

    const settingsHtml = await (await fetch(new URL(`./settings.html?v=${v}`, import.meta.url), { cache: "no-store" })).text();
    $(".lime-phone-settings").remove();
    $("#extensions_settings").append(settingsHtml);

    const phoneHtml = await (await fetch(new URL(`./phone.html?v=${v}`, import.meta.url), { cache: "no-store" })).text();
    $("#j_phone_overlay").remove();
    $("body").append(phoneHtml);

    // 恢复配置
    $("#jp_read_char").prop("checked", s.readChar);
    $("#jp_read_user").prop("checked", s.readUser);
    $("#jp_read_chat").prop("checked", s.readChat);
    $("#jp_api_mode").val(s.apiMode);
    $("#jp_custom_api_box").toggle(s.apiMode === "custom");
    $("#jp_api_url").val(s.apiUrl || "");
    $("#jp_api_key").val(s.apiKey || "");
    if (s.apiModel) {
        $("#jp_api_model").html(`<option value="${s.apiModel}">${s.apiModel}</option>`).val(s.apiModel);
    }
    $("#jp_preset_textarea").val(s.presetText || DEFAULT_PRESET);

    applyCustomColors();

    const toggle = $("#lime_phone_send_btn_toggle");
    toggle.prop("checked", s.showSendBtn);
    toggle.on("change", function () {
        s.showSendBtn = $(this).prop("checked");
        saveSettingsDebounced();
        updateSendButton();
    });

    // ==================== 💊 底部开关胶囊 & 可自由拖动悬浮球 ====================
    $("#jp_mini_bubble").remove();
    const miniBubble = $(`<div id="jp_mini_bubble" class="jp-bubble-hidden" title="按住可拖动，点击恢复小手机">${LIME_PHONE_SVG}</div>`);
    $("body").append(miniBubble);

    // 1. 点击底部 Dock 第4个【开关】按钮：弹出/收起胶囊抽屉
    $(document).on("click", "#jp_dock_ctrl_btn", (e) => {
        e.stopPropagation();
        $("#jp_ctrl_capsule").toggleClass("jp-capsule-hidden");
    });

    // 2. 点击胶囊里的【➖ 缩小成悬浮球】
    $(document).on("click", "#jp_btn_minimize", () => {
        $("#jp_ctrl_capsule").addClass("jp-capsule-hidden");
        togglePhoneModal(false);
        $("#jp_mini_bubble").removeClass("jp-bubble-hidden");
    });

    // 3. 点击胶囊里的【❌ 关闭小手机】
    $(document).on("click", "#jp_btn_close_all", () => {
        $("#jp_ctrl_capsule").addClass("jp-capsule-hidden");
        $("#jp_mini_bubble").addClass("jp-bubble-hidden");
        togglePhoneModal(false);
    });

    // 4. 悬浮球：支持手机手指 & 鼠标全屏自由拖动，轻点则恢复小手机！
    let isDraggingBubble = false;
    let bubbleStartX = 0, bubbleStartY = 0;
    let bubbleInitLeft = 0, bubbleInitTop = 0;

    miniBubble.on("touchstart mousedown", function (e) {
        isDraggingBubble = false;
        const touch = e.type === "touchstart" ? e.originalEvent.touches[0] : e;
        bubbleStartX = touch.clientX;
        bubbleStartY = touch.clientY;
        const rect = this.getBoundingClientRect();
        bubbleInitLeft = rect.left;
        bubbleInitTop = rect.top;
    });

    $(window).off(".jpbubble").on("touchmove.jpbubble mousemove.jpbubble", function (e) {
        if (miniBubble.hasClass("jp-bubble-hidden")) return;
        if (e.type === "mousemove" && e.buttons !== 1) return;
        if (!bubbleStartX && !bubbleStartY) return;

        const touch = e.type === "touchmove" ? e.originalEvent.touches[0] : e;
        const dx = touch.clientX - bubbleStartX;
        const dy = touch.clientY - bubbleStartY;

        if (Math.abs(dx) > 5 || Math.abs(dy) > 5) {
            isDraggingBubble = true;
            const maxLeft = window.innerWidth - 50;
            const maxTop = window.innerHeight - 50;
            const newLeft = Math.max(4, Math.min(maxLeft, bubbleInitLeft + dx));
            const newTop = Math.max(4, Math.min(maxTop, bubbleInitTop + dy));
            miniBubble.css({ left: newLeft + "px", top: newTop + "px", right: "auto", bottom: "auto" });
        }
    });

    miniBubble.on("touchend mouseup", function (e) {
        bubbleStartX = 0;
        bubbleStartY = 0;
        if (!isDraggingBubble) {
            e.preventDefault();
            miniBubble.addClass("jp-bubble-hidden");
            togglePhoneModal(true);
        }
        isDraggingBubble = false;
    });
    $("#jp_desktop_swiper").on("scroll", function () {
        const pageIndex = Math.round(this.scrollLeft / this.clientWidth);
        $("#jp_page_dots .jp-dot").removeClass("main").eq(pageIndex).addClass("main");
    });
    $(document).on("click", ".jp-icon-btn[data-app]", function () {
        switchPage($(this).data("app"));
    });
    $(document).on("click", ".jp-btn-back, .jp-homebar", () => switchPage("jp_p_home"));

    $(document).on("click", ".jp-subtab", function () {
        $(".jp-subtab").removeClass("active");
        $(this).addClass("active");
        const target = $(this).data("sub");
        $(".jp-subpane").removeClass("active");
        $(`#${target}`).addClass("active");
    });

    // 🎨 颜色实时调整与保存事件
    function updateColorsAndSave(newStatus, newApp) {
        if (newStatus) s.statusColor = newStatus;
        if (newApp) s.appnameColor = newApp;
        saveSettingsDebounced();
        applyCustomColors();
    }

    $(document).on("input change", "#jp_status_color_picker", function () {
        updateColorsAndSave($(this).val(), null);
    });
    $(document).on("input change", "#jp_status_color_hex", function () {
        const val = $(this).val().trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) updateColorsAndSave(val, null);
    });

    $(document).on("input change", "#jp_appname_color_picker", function () {
        updateColorsAndSave(null, $(this).val());
    });
    $(document).on("input change", "#jp_appname_color_hex", function () {
        const val = $(this).val().trim();
        if (/^#[0-9A-Fa-f]{6}$/.test(val)) updateColorsAndSave(null, val);
    });

    $(document).on("click", ".jp-quick-color-btn", function () {
        const st = $(this).data("status");
        const app = $(this).data("app");
        updateColorsAndSave(st, app);
        toastr.success(`已切换为主题色：${$(this).text()} ✨`);
    });

    // 角色与 API 设置事件
    $(document).on("click", "#jp_refresh_chars", () => {
        loadCharacterList();
        toastr.success("已刷新角色卡列表！💍");
    });
    $(document).on("change", "#jp_api_mode", function () {
        $("#jp_custom_api_box").toggle($(this).val() === "custom");
    });
    $(document).on("click", "#jp_fetch_models", async () => {
        const url = $("#jp_api_url").val().trim().replace(/\/+$/, "");
        const key = $("#jp_api_key").val().trim();
        if (!url || !key) return toastr.warning("请先填写 API 地址和密钥哦！");
        try {
            toastr.info("正在拉取模型列表...");
            const res = await fetch(`${url}/models`, {
                headers: { "Authorization": `Bearer ${key}` }
            });
            const data = await res.json();
            const list = data.data || [];
            const sel = $("#jp_api_model").empty();
            list.forEach(m => sel.append(`<option value="${m.id}">${m.id}</option>`));
            toastr.success(`成功拉取 ${list.length} 个模型！✨`);
        } catch (err) {
            toastr.error("拉取模型失败：" + err.message);
        }
    });
    $(document).on("click", "#jp_save_api_btn", () => {
        s.boundCharAvatar = $("#jp_char_select").val();
        s.readChar = $("#jp_read_char").prop("checked");
        s.readUser = $("#jp_read_user").prop("checked");
        s.readChat = $("#jp_read_chat").prop("checked");
        s.apiMode = $("#jp_api_mode").val();
        s.apiUrl = $("#jp_api_url").val().trim();
        s.apiKey = $("#jp_api_key").val().trim();
        s.apiModel = $("#jp_api_model").val();
        saveSettingsDebounced();
        toastr.success("角色绑定与 API 设置已永久保存！💍");
    });

    // 世界书载入与条目勾选
    $(document).on("click", "#jp_load_wi_books", async () => {
        await loadWorldBookNames();
        toastr.success("世界书架已载入！📚");
    });
    $(document).on("change", "#jp_wi_book_select", function () {
        loadBookEntries($(this).val());
    });
    $(document).on("click", "#jp_wi_check_all", () => {
        $("#jp_wi_entries_box .jp-wi-entry-chk").prop("checked", true).trigger("change");
    });
    $(document).on("click", "#jp_wi_uncheck_all", () => {
        $("#jp_wi_entries_box .jp-wi-entry-chk").prop("checked", false).trigger("change");
    });

    $(document).on("click", "#jp_sub_wi .jp-wi-acc-head", function () {
        $(this).closest(".jp-wi-accordion").toggleClass("open");
    });

    function setWiClearConfirm(show) {
        $("#jp_wi_clear_normal").toggle(!show);
        $("#jp_wi_clear_confirm").toggleClass("show", show);
        if (!show) {
            $("#jp_wi_clear_checkbox").prop("checked", false);
            $("#jp_wi_clear_confirm_btn").prop("disabled", true);
        }
    }

    $(document).on("click", "#jp_wi_clear_trigger", () => setWiClearConfirm(true));
    $(document).on("click", "#jp_wi_clear_cancel", () => setWiClearConfirm(false));
    $(document).on("change", "#jp_wi_clear_checkbox", function () {
        $("#jp_wi_clear_confirm_btn").prop("disabled", !this.checked);
    });
    $(document).on("click", "#jp_wi_clear_confirm_btn", function () {
        if (!$("#jp_wi_clear_checkbox").prop("checked")) return;

        extension_settings[extName].checkedWi = {};
        saveSettingsDebounced();

        $("#jp_wi_book_select").empty().append('<option value="">请先载入世界书</option>');
        $("#jp_wi_all_title").text("当前书目全部条目（未载入）");
        $("#jp_wi_entries_box").html('<div class="jp-wi-empty">请先载入并选择一本世界书</div>');
        updateWiCountTip();
        setWiClearConfirm(false);
        toastr.info("已清空全部已勾选世界书条目，并重置载入界面");
    });

    $(document).on("click", "#jp_save_preset_btn", () => {
        s.presetText = $("#jp_preset_textarea").val();
        saveSettingsDebounced();
        toastr.success("小手机预设已永久保存！📝");
    });
    $(document).on("click", "#jp_reset_preset_btn", () => {
        $("#jp_preset_textarea").val(DEFAULT_PRESET);
        s.presetText = DEFAULT_PRESET;
        saveSettingsDebounced();
        toastr.info("已恢复默认内置预设 🍋");
    });

    $(document).on("click", "#jp_check_ctx_btn", () => {
        const info = collectPhoneContext();
        toastr.success(
            `💍 绑定角色：${info.charName} (${info.charDesc.length}字)<br>` +
            `🌸 用户设定：${info.userName} (${info.userDesc.length}字)<br>` +
            `📚 已勾世界书：${info.wiCount} 条 (${info.wiText.length}字)<br>` +
            `💬 未隐藏记录：${info.chatCount} 层楼 (${info.chatText.length}字)`,
            "✅ 小手机大脑读取状态",
            { timeOut: 6000, escapeHtml: false }
        );
    });

    $(document).on("change", ".jp-file-in", function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const key = $(this).data("key");

        // 全局壁纸保留原图，不经过 Canvas 压缩；文件大小上限 10MB。
        if (key === "wallpaper") {
            if (file.size > 10 * 1024 * 1024) {
                toastr.warning("壁纸不能超过 10MB，请选择较小的图片。");
                this.value = "";
                return;
            }
            const reader = new FileReader();
            reader.onload = (e) => {
                s.customImages[key] = e.target.result;
                saveSettingsDebounced();
                applySavedImages();
                toastr.success("原画质壁纸已保存！✨");
            };
            reader.onerror = () => {
                toastr.error("壁纸读取失败，请重新选择图片。");
            };
            reader.readAsDataURL(file);
            return;
        }

        // 其他图片继续沿用原有压缩规则，不作改动。
        const maxSize = key === "polaroid" ? 720 : 180;
        compressImage(file, maxSize, (dataUrl) => {
            s.customImages[key] = dataUrl;
            saveSettingsDebounced();
            applySavedImages();
            toastr.success("图片已永久保存到酒馆设置中！✨");
        });
    });

    $(document).on("click", "#jp_reset_all_img", () => {
        s.customImages = {};
        saveSettingsDebounced();
        $("#jp_screen_inner, #jp_polaroid_img, .jp-icon-box").css("background-image", "");
        $("#jp_polaroid_img, .jp-icon-box").children().show();
        toastr.info("已恢复默认青柠奶酪外观 🍋");
    });

    updateSendButton();
    applySavedImages();
});
// =========================================================================
  // =========================================================================
    // 📕【App 模块：小红书】头像/背景 100% 永久保存与自动回显
    // =========================================================================
    extension_settings[extName].xhsProfile = extension_settings[extName].xhsProfile || {
        name: "池衿宴",
        id: "cjy250119",
        ip: "广东",
        bio: "世界是一场盛大的谎言\n你是唯一的真实\n\n                 ——池衿宴",
        bg: "",
        avatar: ""
    };

    // 强制把保存的文字和图片牢牢画在小红书界面上（绝不漏涂）
    function renderXhsProfile() {
        const p = extension_settings[extName].xhsProfile;
        if (!p) return;
        if (p.name) { $("#xhs_display_name").text(p.name); $("#xhs_edit_name").val(p.name); }
        if (p.id) { $("#xhs_display_id").text(p.id); $("#xhs_edit_id").val(p.id); }
        if (p.ip) { $("#xhs_display_ip").text(p.ip); $("#xhs_edit_ip").val(p.ip); }
        if (p.bio) { $("#xhs_desc_text").text(p.bio); $("#xhs_edit_bio").val(p.bio); }
        
        if (p.bg) {
            $("#xhs_bg_img").css({
                "background-image": `url('${p.bg}')`,
                "background-size": "cover",
                "background-position": "center"
            });
        }
        if (p.avatar) {
            $("#xhs_avatar_img, #xhs_detail_avatar").attr("src", p.avatar);
        }
    }

    // 保存文字资料并立刻存入 settings.json
    $(document).on("click", "#xhs_save_profile_btn", () => {
        const p = extension_settings[extName].xhsProfile;
        p.name = $("#xhs_edit_name").val().trim() || "池衿宴";
        p.id = $("#xhs_edit_id").val().trim() || "cjy250119";
        p.ip = $("#xhs_edit_ip").val().trim() || "广东";
        p.bio = $("#xhs_edit_bio").val();
        saveSettingsDebounced();
        renderXhsProfile();
        $("#xhs_profile_edit_modal").hide();
        toastr.success("小红书资料已更新并永久保存！📕✨");
    });

    // 换主页背景图与换头像（自动轻量压缩后存进 settings.json）
    $(document).on("change", ".xhs-file-in", function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const target = $(this).data("target");
        const isAvatar = (target === "xhs_avatar_img");
        
        compressImage(file, isAvatar ? 200 : 720, (dataUrl) => {
            const p = extension_settings[extName].xhsProfile;
            if (isAvatar) p.avatar = dataUrl;
            else p.bg = dataUrl;
            
            saveSettingsDebounced();
            renderXhsProfile();
            toastr.success((isAvatar ? "头像" : "主页背景") + "已永久保存！✨");
        });
    });

// =========================================================================
    // 📕【小红书笔记系统 (1/2)】持久化笔记数据底盘与瀑布流双列渲染
    // =========================================================================
    extension_settings[extName].xhsNotes = extension_settings[extName].xhsNotes || [
        {
            id: "note_init_1",
            title: "山顶雪夜私藏视角",
            content: "雪落在松针上的时候很安静。\n某些人不肯戴围巾，耳朵冻得通红，非要钻进我大衣里取暖。\n下山的时候睡得很沉。",
            tags: "#私人日常 #雪季 #独家记忆",
            likes: "52.1w",
            time: "昨天 22:40",
            isPinned: true,
            bg: "#F9ECEF"
        }
    ];

    let currentXhsNoteIndex = -1;
    const xhsCoverBgs = ["#F9ECEF", "#EEF2F8", "#FBF6EE", "#EFF5F1", "#F4EEF7"];

    function renderXhsNotes() {
        const notes = extension_settings[extName].xhsNotes || [];
        const leftCol = $("#xhs_col_left").empty();
        const rightCol = $("#xhs_col_right").empty();
        $("#xhs_empty_tip").toggle(!notes.length);

        notes.forEach((n, idx) => {
            const cardBg = n.bg || xhsCoverBgs[idx % xhsCoverBgs.length];
            const pinBadge = n.isPinned ? `<span style="position:absolute; top:8px; left:8px; background:rgba(0,0,0,0.65); backdrop-filter:blur(4px); color:#fff; font-size:9px; padding:2px 6px; border-radius:4px; font-weight:600;">📌 置顶</span>` : "";
            const avatarUrl = extension_settings[extName].xhsProfile?.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=CJY&backgroundColor=333333";

            const card = $(`
                <div class="xhs-note-card" data-idx="${idx}" style="background:#fff; border-radius:8px; overflow:hidden; margin-bottom:4px; box-shadow:0 1px 4px rgba(0,0,0,0.06); cursor:pointer;">
                  <div style="height:140px; background:${cardBg}; padding:14px 12px; display:flex; flex-direction:column; justify-content:space-between; position:relative;">
                    ${pinBadge}
                    <div style="font-family:'Noto Serif SC',serif; font-size:13px; font-weight:600; color:#2C3748; line-height:1.5; margin-top:${n.isPinned ? '18px' : '6px'};">${n.title || '无题'}</div>
                    <div style="font-size:10px; color:#8A9BA8; line-height:1.4; display:-webkit-box; -webkit-line-clamp:2; -webkit-box-orient:vertical; overflow:hidden;">${n.content || ''}</div>
                  </div>
                  <div style="padding:8px 8px 10px;">
                    <div style="font-size:12px; font-weight:600; color:#333; margin-bottom:6px; white-space:nowrap; overflow:hidden; text-overflow:ellipsis;">${n.title || '无题'}</div>
                    <div style="display:flex; justify-content:space-between; align-items:center;">
                      <div style="display:flex; align-items:center; gap:5px;">
                        <img src="${avatarUrl}" style="width:16px; height:16px; border-radius:50%; object-fit:cover;">
                        <span style="font-size:10px; color:#666;">池衿宴</span>
                      </div>
                      <div style="display:flex; align-items:center; gap:2px; font-size:10px; color:#999;">
                        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>
                        <span>${n.likes || '1.2w'}</span>
                      </div>
                    </div>
                  </div>
                </div>
            `);

            // 瀑布流均匀分发到左右列
            if (idx % 2 === 0) leftCol.append(card);
            else rightCol.append(card);
        });
    }
    // =========================================================================
    // 📕【小红书笔记系统 (2/2)】详情展开、置顶/编辑/删除与 AI 接球接口
    // =========================================================================
    function openXhsDetail(idx) {
        currentXhsNoteIndex = idx;
        const n = extension_settings[extName].xhsNotes[idx];
        if (!n) return;
        n.comments = Array.isArray(n.comments) ? n.comments : [];
        const p = extension_settings[extName].xhsProfile || {};
        const cardBg = n.bg || xhsCoverBgs[idx % xhsCoverBgs.length];

        $("#xhs_detail_avatar").attr("src", p.avatar || "https://api.dicebear.com/7.x/initials/svg?seed=CJY&backgroundColor=333333");
        $("#xhs_action_pin").text(n.isPinned ? "📌 取消置顶" : "📌 设为置顶");

        const cHtml = n.comments.map((c, ci) => `
            <div style="display:flex; gap:10px; margin-bottom:14px; align-items:flex-start;">
              <img src="${c.avatar || '/Image_1794265484255_735.jpg'}" onerror="this.removeAttribute('src')" style="width:28px; height:28px; border-radius:50%; object-fit:cover; background:#f2edf0; flex-shrink:0;">
              <div style="flex:1; min-width:0;">
                <div style="font-size:11.5px; color:#888;">${c.user || "BerryJam_Tart"}</div>
                <div style="font-size:13px; color:#222; line-height:1.5; margin-top:2px; word-break:break-word;">${c.text || ""}</div>
                <div style="font-size:10px; color:#aaa; margin-top:4px; display:flex; gap:12px;"><span>${c.time || "刚刚 广东"}</span><span data-xhsdelc="${ci}" style="color:#999; cursor:pointer;">删除</span></div>
              </div>
            </div>`).join("");

        $("#xhs_detail_scroll").html(`
            <div style="height:250px; background:${cardBg}; padding:24px 20px; display:flex; flex-direction:column; justify-content:center; align-items:center; text-align:center;">
              <div style="font-family:'Noto Serif SC',serif; font-size:18px; font-weight:600; color:#2C3748; line-height:1.6; max-width:85%;">${n.title || '无题'}</div>
            </div>
            <div style="padding:16px 18px 12px; border-bottom:1px solid #f3f3f3;">
              <h1 style="font-size:15.5px; font-weight:600; color:#222; margin:0 0 8px;">${n.title || ''}</h1>
              <div style="font-size:13px; color:#333; line-height:1.75; white-space:pre-wrap; margin-bottom:10px;">${n.content || ''}</div>
              <div style="font-size:12.5px; color:#13386c; margin-bottom:10px; font-weight:500;">${n.tags || ''}</div>
              <div style="font-size:11px; color:#999;">${n.time || '刚刚'} 广东</div>
            </div>
            <div style="padding:14px 18px 26px;">
              <div style="font-size:12px; color:#666; margin-bottom:14px;">${n.comments.length ? `共 ${n.comments.length} 条评论` : "暂无评论"}</div>
              ${cHtml}
            </div>
        `);
        $("#xhs_detail_page").css("transform", "translateX(0)");
    }

    $(document).on("click", "#xhs_comment_send", () => {
        const val = $("#xhs_comment_input").val().trim();
        const n = extension_settings[extName].xhsNotes?.[currentXhsNoteIndex];
        if (!val || !n) return;
        n.comments = Array.isArray(n.comments) ? n.comments : [];
        const myAva = extension_settings[extName].customImages?.avatar_jiang_anniv || "/Image_1794265484255_735.jpg";
        n.comments.push({ user: "BerryJam_Tart", avatar: myAva, text: val, time: "刚刚 广东" });
        $("#xhs_comment_input").val("");
        saveSettingsDebounced();
        openXhsDetail(currentXhsNoteIndex);
    });
    $(document).on("click", "[data-xhsdelc]", function () {
        const n = extension_settings[extName].xhsNotes?.[currentXhsNoteIndex];
        if (!n || !Array.isArray(n.comments)) return;
        n.comments.splice(Number($(this).data("xhsdelc")), 1);
        saveSettingsDebounced();
        openXhsDetail(currentXhsNoteIndex);
    });

    $(document).on("click", ".xhs-note-card", function () { openXhsDetail(Number($(this).data("idx"))); });
    $(document).on("click", "#xhs_edit_btn", () => $("#xhs_more_menu_modal").css("display", "flex"));
    $(document).on("click", "#xhs_action_cancel, #xhs_more_menu_modal", function (e) {
        if (e.target === this) $("#xhs_more_menu_modal").hide();
    });

    // 📌 设为置顶 / 取消置顶
    $(document).on("click", "#xhs_action_pin", () => {
        const notes = extension_settings[extName].xhsNotes;
        if (currentXhsNoteIndex < 0 || !notes[currentXhsNoteIndex]) return;
        const cur = notes[currentXhsNoteIndex];
        const willPin = !cur.isPinned;
        notes.forEach(x => { x.isPinned = false; });
        cur.isPinned = willPin;
        if (willPin) { notes.splice(currentXhsNoteIndex, 1); notes.unshift(cur); currentXhsNoteIndex = 0; }
        saveSettingsDebounced();
        renderXhsNotes();
        $("#xhs_more_menu_modal").hide();
        openXhsDetail(currentXhsNoteIndex);
        toastr.success(willPin ? "已设为置顶笔记！📌" : "已取消置顶！");
    });

    // 🗑️ 删除笔记
    $(document).on("click", "#xhs_action_delete", () => {
        const notes = extension_settings[extName].xhsNotes;
        if (currentXhsNoteIndex < 0 || !notes[currentXhsNoteIndex]) return;
        notes.splice(currentXhsNoteIndex, 1);
        saveSettingsDebounced();
        renderXhsNotes();
        $("#xhs_more_menu_modal").hide();
        document.getElementById("xhs_detail_page").style.transform = "translateX(100%)";
        toastr.info("笔记已删除");
    });

    // ✍️ 手动编辑笔记并保存
    $(document).on("click", "#xhs_action_edit", () => {
        const n = extension_settings[extName].xhsNotes[currentXhsNoteIndex];
        if (!n) return;
        $("#xhs_in_note_title").val(n.title || "");
        $("#xhs_in_note_content").val(n.content || "");
        $("#xhs_in_note_tags").val(n.tags || "");
        $("#xhs_more_menu_modal").hide();
        $("#xhs_note_edit_modal").css("display", "flex");
    });
    $(document).on("click", "#xhs_close_note_edit", () => $("#xhs_note_edit_modal").hide());
    $(document).on("click", "#xhs_save_note_edit_btn", () => {
        const n = extension_settings[extName].xhsNotes[currentXhsNoteIndex];
        if (!n) return;
        n.title = $("#xhs_in_note_title").val().trim() || "无题";
        n.content = $("#xhs_in_note_content").val().trim();
        n.tags = $("#xhs_in_note_tags").val().trim();
        saveSettingsDebounced();
        renderXhsNotes();
        $("#xhs_note_edit_modal").hide();
        openXhsDetail(currentXhsNoteIndex);
        toastr.success("笔记修改已保存！✨");
    });

    // 🚀【核心 AI 接球接口】相同回执更新原笔记，不重复插入
    window.addXhsNoteFromAI = function (payload) {
        if (!payload || typeof payload !== "object") return;
        const notes = extension_settings[extName].xhsNotes || (extension_settings[extName].xhsNotes = []);
        const title = payload.title || "最新随手记录";
        const content = payload.content || "";
        const tags = payload.tags || "#日常生活";
        const key = wvMakeKey("xhs", [title, content, tags]);
        const existing = notes.find(n => n._wvKey === key || wvMakeKey("xhs", [n.title || "", n.content || "", n.tags || ""]) === key);
        const now = new Date();
        const timeStr = `${now.getMonth() + 1}月${now.getDate()}日 ${String(now.getHours()).padStart(2, "0")}:${String(now.getMinutes()).padStart(2, "0")}`;
        if (existing) {
            Object.assign(existing, {
                title, content, tags,
                likes: payload.likes || existing.likes,
                _wvKey: key
            });
        } else {
            const newNote = {
                id: "note_" + Date.now(),
                title, content, tags,
                likes: payload.likes || (Math.floor(Math.random() * 10 + 1) + "." + Math.floor(Math.random() * 9) + "w"),
                time: payload.time || timeStr,
                isPinned: false,
                bg: xhsCoverBgs[notes.length % xhsCoverBgs.length],
                _wvKey: key
            };
            const pinIdx = notes.findIndex(x => x.isPinned);
            if (pinIdx !== -1) notes.splice(pinIdx + 1, 0, newNote);
            else notes.unshift(newNote);
        }
        saveSettingsDebounced();
        renderXhsNotes();
    };

    $(document).on("click", '.jp-icon-btn[data-app="jp_p_xhs"]', () => renderXhsNotes());
    setTimeout(renderXhsNotes, 300);
    
    
    
    //=========================================================================// 🎀【全自动扫描桌面】以后加多少个 App，设置里就自动生成多少个换图标按钮！
    // =========================================================================
    function autoBuildAppIconSettings() {
        const container = $("#jp_auto_app_icons_box");
        if (!container.length) return;
        container.empty();

        $("#jp_desktop_swiper .jp-grid .jp-icon-btn").each(function () {
            const appTarget = $(this).data("app");
            const appName = $(this).find(".jp-icon-name").text().trim() || "应用";
            const iconKey = "ico_" + appTarget.replace("jp_p_", "");
            const iconBox = $(this).find(".jp-icon-box");
            const iconBoxId = iconBox.attr("id") || `jp_ico_${appTarget.replace("jp_p_", "")}`;
            iconBox.attr("id", iconBoxId);

            const row = $(`
                <div class="jp-upload-row">
                    <span>📱 ${appName} 图标</span>
                    <label class="jp-up-btn">📂 换图标
                        <input type="file" accept="image/*" class="jp-file-in" data-key="${iconKey}" data-target="${iconBoxId}" data-clear="1" style="display:none">
                    </label>
                </div>
            `);
            container.append(row);
        });
    }

    // 每次点开小红书，自动重画头像与背景；每次点开设置，自动扫描桌面 App
    const oldSwitchPage = switchPage;
    switchPage = function (pageId) {
        oldSwitchPage(pageId);
        if (pageId === "jp_p_xhs") {
            renderXhsProfile();
        } else if (pageId === "jp_p_set") {
            autoBuildAppIconSettings();
        }
    };

    renderXhsProfile();
    // =========================================================================
    // 💳【App 模块：私人钱包 (上)】本金数据、智能匹配图标、界面渲染
    // =========================================================================
    extension_settings[extName].walletData = Object.assign({
        balance: 193579800,
        balanceColor: "#8B5E12",
        bg: "",
        cardBg: "",
        lastIn: "+0.00",
        lastOut: "-0.00",
        bills: []
    }, extension_settings[extName].walletData || {});

    function getSmartBillIcon(title, amount) {
        const t = String(title || "");
        if (/亲密付|绛绛|老婆|转账|零花|副卡/.test(t)) return "💝";
        if (/甜品|下午茶|蛋糕|草莓|奶茶|糖|巧克力/.test(t)) return "🍓";
        if (/餐厅|私厨|晚宴|米其林|晚饭|早餐|食材/.test(t)) return "🍽️";
        if (/乳业|牧场|奶|集团|亚太|欧洲|分红|结算|营收/.test(t)) return "🥛";
        if (/信托|私行|银行|股息|基金|债券|息票|专利/.test(t)) return "📈";
        if (/钻|珠宝|拍卖|苏富比|佳士得|项链|戒指|胸针|冠冕|宝石/.test(t)) return "💎";
        if (/高定|礼服|衣|裙|包|爱马仕|香奈儿|迪奥|鞋|丝巾/.test(t)) return "👗";
        if (/飞机|湾流|航线|游艇|车|迈巴赫|劳斯莱斯|法拉利|机队/.test(t)) return "✈️";
        if (/花|玫瑰|郁金香|空运|花艺/.test(t)) return "🌹";
        if (/表|百达翡丽|江诗丹顿|袖扣|西装|养护|保养/.test(t)) return "⌚";
        if (/庄园|别墅|房产|岛|酒庄|物业/.test(t)) return "🏰";
        return Number(amount) >= 0 ? "💰" : "💳";
    }

    function renderWalletApp() {
        const w = extension_settings[extName].walletData;
        if (!w) return;
        if (w.bg) $("#jp_p_wallet").css("background-image", `url('${w.bg}')`);
        if (w.cardBg) $("#jp_wallet_card_bg").css("background-image", `url('${w.cardBg}')`);

        const balNum = Number(w.balance) || 0;
        $("#jp_wallet_balance")
            .text("¥ " + balNum.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
            .css("color", w.balanceColor || "#8B5E12");
        $("#jp_wallet_edit_cap").val(balNum);
        $("#jp_wallet_in").text(w.lastIn || "+0.00");
        $("#jp_wallet_out").text(w.lastOut || "-0.00");

        const listEl = $("#jp_wallet_bill_list");
        if (!Array.isArray(w.bills) || w.bills.length === 0) {
            listEl.html(`<div style="text-align:center; padding:45px 0; color:rgba(28,28,30,0.45); font-size:11.5px;">暂无近期账单明细 · 等待生成刷新 ✨</div>`);
            return;
        }

        let html = "";
        w.bills.slice(0, 10).forEach(item => {
            const amt = Number(item.amount) || 0;
            const isPlus = amt >= 0;
            const sign = isPlus ? "+ " : "- ";
            const color = isPlus ? "#8B5E12" : "#111111";
            const icon = item.icon || getSmartBillIcon(item.title, amt);
            const formattedAmt = Math.abs(amt).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            html += `
                <div style="display:flex; align-items:center; justify-content:space-between; padding:8px 10px; background:rgba(255, 255, 255, 0.20); backdrop-filter:blur(3px); -webkit-backdrop-filter:blur(3px); border:0.5px solid rgba(255,255,255,0.45); border-radius:12px;">
                  <div style="display:flex; align-items:center; gap:9px;">
                    <div style="width:28px; height:28px; border-radius:50%; background:rgba(255,255,255,0.35); border:0.5px solid rgba(255,255,255,0.5); display:flex; align-items:center; justify-content:center; font-size:13px; flex-shrink:0;">${icon}</div>
                    <div>
                      <div class="w-thin-text" style="font-size:11.5px; color:#111; font-weight:500;">${item.title || "账单明细"}</div>
                      <div class="w-thin-text" style="font-size:9.5px; color:#333; margin-top:1px; display:block;">${item.sub || "刚刚"}</div>
                    </div>
                  </div>
                  <div class="w-tall-num" style="font-size:12.5px; color:${color}; white-space:nowrap;">${sign}¥ ${formattedAmt}</div>
                </div>`;
        });
        listEl.html(html);
    }
    // =========================================================================
    // 💳【App 模块：私人钱包 (下)】AI 覆盖记账、秘密暗格设置与永久保存
    // =========================================================================
    window.updateWalletFromAI = function (newBillsArray) {
        if (!Array.isArray(newBillsArray) || !newBillsArray.length) return;
        const w = extension_settings[extName].walletData;
        if (!Array.isArray(w.aiBillKeys)) {
            w.aiBillKeys = (w.bills || []).map(b => wvMakeKey("wallet", [b.title || "", Number(b.amount) || 0, b.sub || ""]));
        }
        const accepted = [];
        let sumIn = 0, sumOut = 0;
        newBillsArray.slice(0, 10).forEach(b => {
            const key = wvMakeKey("wallet", [b.title || "", Number(b.amount) || 0, b.sub || ""]);
            if (w.aiBillKeys.includes(key)) return;
            w.aiBillKeys.push(key);
            accepted.push({ ...b, _wvKey: key });
            const a = Number(b.amount) || 0;
            if (a >= 0) sumIn += a;
            else sumOut += Math.abs(a);
        });
        if (accepted.length) {
            w.balance = (Number(w.balance) || 0) + sumIn - sumOut;
            w.lastIn = "+" + (sumIn >= 10000 ? (sumIn / 10000).toFixed(1) + "万" : sumIn.toFixed(2));
            w.lastOut = "-" + (sumOut >= 10000 ? (sumOut / 10000).toFixed(1) + "万" : sumOut.toFixed(2));
            w.bills = accepted.slice(0, 10);
        }
        saveSettingsDebounced();
        renderWalletApp();
    };

    // 秘密机关：点击 WALLET 或 CENTURION·0119 打开暗格
    $(document).on("click", "#jp_wallet_secret_btn1, #jp_wallet_secret_btn2", () => {
        $("#jp_wallet_secret_modal").css("display", "flex");
    });
    $(document).on("click", "#jp_wallet_close_modal", () => {
        $("#jp_wallet_secret_modal").hide();
    });

    // 秘密机关：点击金额数字切换 金色 / 黑色 / 白色
    const walletColors = ["#8B5E12", "#1C1C1E", "#FFFFFF"];
    $(document).on("click", "#jp_wallet_balance_box", () => {
        const w = extension_settings[extName].walletData;
        const idx = (walletColors.indexOf(w.balanceColor) + 1) % walletColors.length;
        w.balanceColor = walletColors[idx];
        saveSettingsDebounced();
        renderWalletApp();
    });

    // 暗格上传钱包背景与银行卡面（永久保存到 settings.json）
    $(document).on("change", ".wallet-file-in", function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const type = $(this).data("type");
        compressImage(file, 720, (dataUrl) => {
            const w = extension_settings[extName].walletData;
            if (type === "bg") w.bg = dataUrl;
            else w.cardBg = dataUrl;
            saveSettingsDebounced();
            renderWalletApp();
            toastr.success((type === "bg" ? "钱包背景" : "银行卡面") + "已永久保存！💳✨");
        });
    });

    // 暗格修改本金并永久保存
    $(document).on("click", "#jp_wallet_save_secret", () => {
        const w = extension_settings[extName].walletData;
        const val = parseFloat($("#jp_wallet_edit_cap").val());
        if (!isNaN(val)) w.balance = val;
        saveSettingsDebounced();
        renderWalletApp();
        $("#jp_wallet_secret_modal").hide();
        toastr.success("钱包本金已永久锁定！💰✨");
    });

    // 独立监听点开钱包图标时刷新画面（无需改动上面的代码！）
    $(document).on("click", '.jp-icon-btn[data-app="jp_p_wallet"]', () => {
        renderWalletApp();
    });

    renderWalletApp();
    
// =========================================================================
    // ✨【桌面 20 格自由拖拽系统（磁吸稳固版）】实时建格 + 自动吸附最近格子
    // =========================================================================
    function ensureDesktopGridReady() {
        extension_settings[extName] = extension_settings[extName] || {};
        extension_settings[extName].iconSlots = Object.assign({
            jp_p_moments: 0,
            jp_p_xhs: 1,
            jp_p_weibo: 2,
            jp_p_forum: 3,
            jp_p_wallet: 4,
            jp_p_set: 15
        }, extension_settings[extName].iconSlots || {});

        const grid = $("#jp_desktop_swiper .jp-grid");
        if (!grid.length) return null;

        // 如果还没生成 20 个格子，当场立刻生成！
        if (grid.find(".jp-slot").length === 0) {
            grid.attr("id", "jp_app_grid").css({
                "display": "grid",
                "grid-template-columns": "repeat(4, 1fr)",
                "grid-template-rows": "repeat(6, 1fr)", "height": "100%",
                "gap": "10px 8px"
            });

            const savedMap = extension_settings[extName].iconSlots;
            const buttons = grid.children(".jp-icon-btn").detach();

            for (let i = 0; i < 24; i++) {
                grid.append(`<div class="jp-slot" data-slot="${i}" style="width:100%; height:100%; display:flex; align-items:center; justify-content:center; border-radius:16px;"></div>`);
            }

            buttons.each(function (idx) {
                $(this).css({ "grid-column": "", "grid-row": "", "touch-action": "none", "user-select": "none" });
                const appKey = $(this).data("app");
                let slotIdx = savedMap[appKey] !== undefined ? savedMap[appKey] : idx;
                let targetSlot = grid.find(`.jp-slot[data-slot="${slotIdx}"]`);
                if (!targetSlot.length || targetSlot.children().length > 0) {
                    targetSlot = grid.find(".jp-slot:empty").first();
                }
                targetSlot.append(this);
            });
        }
        return grid;
    }

    // 每次点开手机或回到桌面时，确保 20 个格子已经建好
    $(document).on("click", "#lime_phone_entry_btn, .jp-btn-back, .jp-homebar", () => {
        setTimeout(ensureDesktopGridReady, 50);
    });
    setTimeout(ensureDesktopGridReady, 500);

    // 原生 pointer 事件（与预览框完全同源）+ 最近格子磁吸
    let dragCandidate = null, dragSourceSlot = null, dragClone = null;
    let startX = 0, startY = 0, justDragged = false;

    $(document).on("pointerdown", "#jp_desktop_swiper .jp-grid .jp-icon-btn", function (e) {
        ensureDesktopGridReady();
        startX = e.clientX;
        startY = e.clientY;
        dragCandidate = this;
        dragSourceSlot = this.parentElement;
        justDragged = false;
        if (this.setPointerCapture && e.pointerId !== undefined) {
            try { this.setPointerCapture(e.pointerId); } catch (err) {}
        }
        $("#jp_desktop_swiper").css("overflow-x", "hidden");
    });

    $(document).on("pointermove", "#jp_desktop_swiper .jp-grid .jp-icon-btn", function (e) {
        if (!dragCandidate || dragCandidate !== this) return;
        const dx = e.clientX - startX;
        const dy = e.clientY - startY;

        if (!dragClone && (Math.abs(dx) > 5 || Math.abs(dy) > 5)) {
            justDragged = true;
            $("#jp_desktop_swiper .jp-grid").addClass("dragging-mode");
            $("#jp_desktop_swiper .jp-slot").css("border", "1px dashed rgba(255,255,255,0.6)");
            const rect = dragCandidate.getBoundingClientRect();
            dragClone = $(dragCandidate).clone().addClass("is-dragging").css({
                position: "fixed", left: rect.left + "px", top: rect.top + "px",
                width: rect.width + "px", margin: 0, zIndex: 999999, pointerEvents: "none"
            }).appendTo("body");
            $(dragCandidate).css("opacity", "0.2");
        }

        if (dragClone) {
            dragClone.css({ left: (e.clientX - 28) + "px", top: (e.clientY - 28) + "px" });
        }
    });

    $(document).on("pointerup pointercancel", "#jp_desktop_swiper .jp-grid .jp-icon-btn", function (e) {
        $("#jp_desktop_swiper").css("overflow-x", "auto");
        if (!dragCandidate || dragCandidate !== this) return;

        if (dragClone) {
            const dropX = e.clientX;
            const dropY = e.clientY;

            dragClone.remove();
            dragClone = null;
            $(dragCandidate).css("opacity", "1");
            $("#jp_desktop_swiper .jp-grid").removeClass("dragging-mode");
            $("#jp_desktop_swiper .jp-slot").css("border", "none");

            // 磁吸算法：自动寻找距离手指最近的那个格子（哪怕停在缝隙里也能吸过去！）
            let bestSlot = null;
            let minDistance = 999999;
            $("#jp_desktop_swiper .jp-slot").each(function () {
                const r = this.getBoundingClientRect();
                const centerX = (r.left + r.right) / 2;
                const centerY = (r.top + r.bottom) / 2;
                const dist = Math.hypot(dropX - centerX, dropY - centerY);
                if (dist < minDistance && dist < 85) {
                    minDistance = dist;
                    bestSlot = this;
                }
            });

            if (bestSlot && bestSlot !== dragSourceSlot) {
                const existing = $(bestSlot).children(".jp-icon-btn");
                if (existing.length) $(dragSourceSlot).append(existing);
                $(bestSlot).append(dragCandidate);

                $("#jp_desktop_swiper .jp-slot").each(function () {
                    const slotNum = Number($(this).data("slot"));
                    const child = $(this).children(".jp-icon-btn");
                    if (child.length) {
                        extension_settings[extName].iconSlots[child.data("app")] = slotNum;
                    }
                });
                saveSettingsDebounced();
            }
            setTimeout(() => { justDragged = false; }, 100);
        }
        dragCandidate = null;
        dragSourceSlot = null;
    });

    $(document).on("click", "#jp_desktop_swiper .jp-grid .jp-icon-btn", function (e) {
        if (justDragged) {
            e.stopImmediatePropagation();
            e.preventDefault();
        }
    });
    // =========================================================================
    // 🎵【App 模块：网易云音乐 (1/4)】初始数据、Audio 引擎与分享链接自动解析
    // =========================================================================
    extension_settings[extName].ncmData = Object.assign({
        avatar: "",
        bg: "",
        liked: true,
        currentIndex: 0,
        tracks: [
            { name: "Camille's Night", artist: "Berk Kaynaş", url: "" },
            { name: "Animal", artist: "Rauf & Faik", url: "" },
            { name: "Убью тебя", artist: "Ханна / Миша Марвин", url: "" }
        ]
    }, extension_settings[extName].ncmData || {});

    const jpAudio = window.jpAudioPlayer || (window.jpAudioPlayer = new Audio());
    jpAudio.preload = "auto";
    let isNcmPlaying = false;

    // 注入全局隐身头，防止网易云音频 403 拒播
    if (!$('meta[name="referrer"]').length) $("head").append('<meta name="referrer" content="no-referrer">');

    async function resolveSongUrl(rawInput) {
        const str = String(rawInput || "").trim();
        const titleKw = $("#jp_in_song_title").val().trim();
        const apis = ["https://api.qijieya.cn/meting/", "https://api.injahow.cn/meting/"];
        const fixUrl = (u) => u ? (u.includes("type=url") && !u.includes("br=") ? u + "&br=128&redirect=1" : u) : "";

        // 1. 如果没填链接只填了歌名 -> 直接像桃桃一样按歌名搜索点歌！
        if (!str && titleKw) {
            for (const api of apis) {
                try {
                    const res = await fetch(`${api}?server=netease&type=search&id=${encodeURIComponent(titleKw)}&limit=10`, { credentials: "omit", referrerPolicy: "no-referrer" });
                    const list = await res.json();
                    if (Array.isArray(list) && list.length) {
                        return [{ name: list[0].name || list[0].title, artist: list[0].artist || list[0].author, url: fixUrl(list[0].url) }];
                    }
                } catch (e) {}
            }
        }

        // 2. 提取歌单或单曲的数字 ID（完整链接或纯数字 ID）
        const id = (str.match(/[?&]id=(\d+)/) || str.match(/(?:playlist|song)\/(\d+)/) || str.match(/^(\d{5,19})$/) || [])[1];
        if (!id) {
            toastr.warning("163cn.tv 短链请先在浏览器打开一次，复制带 id=数字 的完整链接或纯数字ID哦！");
            return [];
        }

        const isPlaylist = /playlist/i.test(str) || /歌单/.test(str) || !/song/i.test(str);
        for (const api of apis) {
            try {
                const type = isPlaylist ? "playlist" : "song";
                const res = await fetch(`${api}?server=netease&type=${type}&id=${id}`, { credentials: "omit", referrerPolicy: "no-referrer" });
                const list = await res.json();
                if (Array.isArray(list) && list.length) {
                    return list.map(x => ({ name: x.name || x.title, artist: x.artist || x.author, url: fixUrl(x.url) }));
                }
            } catch (e) {}
        }
        return [];
    }
    // =========================================================================
    // 🎵【App 模块：网易云音乐 (2/4)】三端头像、歌名、唱针与黑胶旋转同步渲染
    // =========================================================================
    function renderNcmAll() {
        const d = extension_settings[extName].ncmData;
        if (!d) return;
        const list = Array.isArray(d.tracks) && d.tracks.length ? d.tracks : [{ name: "Camille's Night", artist: "Berk Kaynaş", url: "" }];
        if (d.currentIndex >= list.length) d.currentIndex = 0;
        const cur = list[d.currentIndex];

        if (d.avatar) $(".sync-ncm-avatar").attr("src", d.avatar);
        if (d.bg) {
            $("#jp_ncm_profile_bg").css("background-image", `linear-gradient(to bottom, rgba(40,42,48,0.2) 0%, rgba(55,55,60,0.85) 100%), url('${d.bg}')`);
        }

        $(".sync-ncm-title").text(`${cur.name} - ${cur.artist}`);
        $(".sync-ncm-onlyname").text(cur.name);
        $(".sync-ncm-artist").text(cur.artist);
        $("#jp_ncm_song_count").text(list.length);

        $("#jp_ncm_w_disc, #jp_v_big_disc").toggleClass("playing", isNcmPlaying);
        $("#jp_vinyl_needle").css("transform", isNcmPlaying ? "rotate(0deg)" : "rotate(-28deg)");
        $(".sync-like-svg").attr("fill", d.liked ? "#FE3A3B" : "none");

        const miniPlay = `<svg width="19" height="19" viewBox="0 0 24 24" fill="#1E293B"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
        const miniPause = `<svg width="19" height="19" viewBox="0 0 24 24" fill="#1E293B"><rect x="6" y="4" width="4" height="16" rx="1"/><rect x="14" y="4" width="4" height="16" rx="1"/></svg>`;
        $(".sync-mini-play").html(isNcmPlaying ? miniPause : miniPlay);

        const bigPlay = `<svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><polygon points="6 4 20 12 6 20 6 4"/></svg>`;
        const bigPause = `<svg width="32" height="32" viewBox="0 0 24 24" fill="#fff"><rect x="6" y="4" width="4.5" height="16" rx="1.2"/><rect x="13.5" y="4" width="4.5" height="16" rx="1.2"/></svg>`;
        $(".sync-big-play").html(isNcmPlaying ? bigPause : bigPlay);

        const trackBox = $("#jp_ncm_track_list");
        if (trackBox.length) {
            trackBox.html(list.map((item, i) => `
                <div class="jp-ncm-track-item" data-idx="${i}" style="padding:8px 10px; border-radius:8px; background:${i === d.currentIndex ? '#fff0f0' : '#f7f8fa'}; display:flex; justify-content:space-between; align-items:center; cursor:pointer; font-size:12px;">
                  <span style="font-weight:${i === d.currentIndex ? '700' : '400'}; color:${i === d.currentIndex ? '#FF3A3A' : '#222'};">${i + 1}. ${item.name} - ${item.artist}</span>
                  <span style="font-size:11px; color:#888;">${i === d.currentIndex ? (isNcmPlaying ? '正在播放' : '已暂停') : '播放'}</span>
                </div>
            `).join(""));
        }
    }
    // =========================================================================
    // 🎵【App 模块：网易云音乐 (3/4)】后台播放控制、切歌与三页面滑动事件
    // =========================================================================
    async function playCurrentNcmTrack(forcePlay) {
        const d = extension_settings[extName].ncmData;
        const cur = d.tracks[d.currentIndex];
        if (forcePlay !== undefined) isNcmPlaying = forcePlay;
        else isNcmPlaying = !isNcmPlaying;

        if (isNcmPlaying && cur && cur.url) {
            if (jpAudio.src !== cur.url) jpAudio.src = cur.url;
            jpAudio.play().catch(() => {});
        } else {
            jpAudio.pause();
        }
        renderNcmAll();
    }

    jpAudio.onended = () => {
        const d = extension_settings[extName].ncmData;
        d.currentIndex = (d.currentIndex + 1) % d.tracks.length;
        playCurrentNcmTrack(true);
    };

    function scrollNcmSlide(idx) {
        const sw = document.getElementById("jp_ncm_swiper");
        if (sw) sw.scrollTo({ left: idx * sw.clientWidth, behavior: "smooth" });
    }

    // 点桌面第1页音乐小卡片 或 第2页网易云图标 -> 打开小房子并定位到第1页大唱片页
    $(document).on("click", '#jp_ncm_widget_card, .jp-icon-btn[data-app="jp_p_ncm"]', function () {
        switchPage("jp_p_ncm");
        renderNcmAll();
        setTimeout(() => scrollNcmSlide(0), 30);
    });

    $(document).on("click", ".jp-ncm-play-btn", (e) => { e.stopPropagation(); playCurrentNcmTrack(); });
    $(document).on("click", ".jp-ncm-next-btn", (e) => {
        e.stopPropagation();
        const d = extension_settings[extName].ncmData;
        d.currentIndex = (d.currentIndex + 1) % d.tracks.length;
        saveSettingsDebounced();
        playCurrentNcmTrack(true);
    });
    $(document).on("click", ".jp-ncm-prev-btn", (e) => {
        e.stopPropagation();
        const d = extension_settings[extName].ncmData;
        d.currentIndex = (d.currentIndex - 1 + d.tracks.length) % d.tracks.length;
        saveSettingsDebounced();
        playCurrentNcmTrack(true);
    });
    $(document).on("click", ".jp-ncm-like-btn", (e) => {
        e.stopPropagation();
        const d = extension_settings[extName].ncmData;
        d.liked = !d.liked;
        saveSettingsDebounced();
        renderNcmAll();
    });

    $(document).on("click", ".jp-ncm-go-slide", function () {
        scrollNcmSlide(Number($(this).data("slide")) || 0);
    });
    $(document).on("scroll", "#jp_ncm_swiper", function () {
        const p = Math.round(this.scrollLeft / this.clientWidth);
        $("#jp_ncm_dots .ncm-pdot").removeClass("active").eq(p).addClass("active");
    });
    // =========================================================================
    // 🎵【App 模块：网易云音乐 (4/4)】导入歌单与换头像背景永久保存
    // =========================================================================
    $(document).on("click", "#jp_ncm_open_like_drawer", () => $("#jp_ncm_like_drawer").css("display", "flex"));
    $(document).on("click", "#jp_ncm_close_like", () => $("#jp_ncm_like_drawer").hide());
    $(document).on("click", "#jp_ncm_open_bg_modal", () => $("#jp_ncm_bg_modal").css("display", "flex"));
    $(document).on("click", "#jp_ncm_close_bg", () => $("#jp_ncm_bg_modal").hide());

    $(document).on("click", ".jp-ncm-track-item", function () {
        const d = extension_settings[extName].ncmData;
        d.currentIndex = Number($(this).data("idx")) || 0;
        saveSettingsDebounced();
        $("#jp_ncm_like_drawer").hide();
        playCurrentNcmTrack(true);
        scrollNcmSlide(0);
    });

    $(document).on("click", "#jp_ncm_add_song_btn", async () => {
        const rawTitle = $("#jp_in_song_title").val().trim();
        const rawUrl = $("#jp_in_song_url").val().trim();
        if (!rawTitle && !rawUrl) return toastr.warning("请填写歌名或歌单链接哦！");
        toastr.info("正在解析歌单/歌曲... 🎵");
        const list = await resolveSongUrl(rawUrl);
        const d = extension_settings[extName].ncmData;
        if (list.length > 1) {
            d.tracks = list;
            d.currentIndex = 0;
            toastr.success(`歌单解析成功！已导入 ${list.length} 首歌！🎵`);
        } else {
            const p = list[0] || {};
            const parts = rawTitle.split("-");
            d.tracks.push({ name: (parts[0] || p.name || "未知单曲").trim(), artist: (parts[1] || p.artist || "池衿宴").trim(), url: p.url || rawUrl });
            d.currentIndex = d.tracks.length - 1;
            toastr.success("单曲已导入并保存！🎵");
        }
        saveSettingsDebounced();
        $("#jp_in_song_title, #jp_in_song_url").val("");
        playCurrentNcmTrack(true);
    });

    $(document).on("change", ".ncm-file-in", function () {
        const file = this.files && this.files[0];
        if (!file) return;
        const type = $(this).data("type");
        compressImage(file, type === "avatar" ? 300 : 720, (dataUrl) => {
            const d = extension_settings[extName].ncmData;
            if (type === "avatar") d.avatar = dataUrl;
            else d.bg = dataUrl;
            saveSettingsDebounced();
            renderNcmAll();
            $("#jp_ncm_bg_modal").hide();
            toastr.success((type === "avatar" ? "网易云头像(已同步音乐卡)" : "主页背景") + "已永久保存！✨");
        });
    });

    setTimeout(renderNcmAll, 300);
    // =========================================================================
    // 📜【网易云真歌词实时滚动 + 进度条同步补丁】自动抓取 LRC 双语歌词并随音乐滚动
    // =========================================================================
    let jpLrcRows = [], jpLrcActiveIdx = -2, jpLastLrcUrl = "";
    const lrcBoxSelector = '#jp_ncm_swiper .ncm-slide:eq(1) .jp-ncm-go-slide[data-slide="0"]';

    function formatNcmTime(sec) {
        if (!Number.isFinite(sec) || sec < 0) return "00:00";
        return `${String(Math.floor(sec / 60)).padStart(2, "0")}:${String(Math.floor(sec % 60)).padStart(2, "0")}`;
    }

    async function loadCurrentTrackLyrics() {
        const d = extension_settings[extName]?.ncmData;
        const cur = d?.tracks?.[d.currentIndex];
        if (!cur) return;
        const sid = (String(cur.url || "").match(/[?&]id=(\d+)/) || [])[1];
        if (!sid) {
            $(lrcBoxSelector).html(`<div style="font-size:14px; color:rgba(255,255,255,0.6);">暂无歌词</div>`);
            return;
        }
        const lrcUrl = `https://api.qijieya.cn/meting/?server=netease&type=lrc&id=${sid}`;
        if (lrcUrl === jpLastLrcUrl) return;
        jpLastLrcUrl = lrcUrl;
        jpLrcRows = []; jpLrcActiveIdx = -2;
        $(lrcBoxSelector).html(`<div style="font-size:13px; color:rgba(255,255,255,0.5);">正在加载歌词...</div>`);

        try {
            const raw = await (await fetch(lrcUrl, { credentials: "omit", referrerPolicy: "no-referrer" })).text();
            const map = new Map();
            raw.split(/\r?\n/).forEach(line => {
                const m = line.match(/\[(\d{1,3}):(\d{2}(?:\.\d{1,3})?)\]/);
                const text = line.replace(/\[[^\]]*\]/g, "").trim();
                if (m && text) {
                    const t = Math.round((Number(m[1]) * 60 + Number(m[2])) * 10) / 10;
                    map.set(t, map.has(t) ? map.get(t) + "\n" + text : text);
                }
            });
            jpLrcRows = [...map.entries()].sort((a, b) => a[0] - b[0]).map(([time, text]) => ({ time, text }));
            if (!jpLrcRows.length) $(lrcBoxSelector).html(`<div style="font-size:14px; color:rgba(255,255,255,0.6);">纯音乐，请欣赏 ✨</div>`);
        } catch (e) {
            $(lrcBoxSelector).html(`<div style="font-size:14px; color:rgba(255,255,255,0.6);">暂无歌词</div>`);
        }
    }

    jpAudio.addEventListener("play", loadCurrentTrackLyrics);
    jpAudio.addEventListener("loadedmetadata", loadCurrentTrackLyrics);

    // 真机全屏比例自动校准：放大黑胶(286px)、把黑胶上提贴合白色唱针、拉开歌词页全屏行距
    function fixNcmFullscreenLayout() {
        $("#jp_v_big_disc").css({ width: "286px", height: "286px", marginTop: "100px" })
            .find("img").css({ width: "184px", height: "184px" });
        $("#jp_vinyl_needle").css({ width: "150px", height: "200px", top: "10px", left: "44%", transformOrigin: "18.75% 13.64%" });
        $("#jp_v_big_disc").parent().css({ justifyContent: "flex-start", paddingTop: "16px" })
            .children().last().css({ marginTop: "auto", marginBottom: "18px" });
        $(lrcBoxSelector).css({ justifyContent: "space-evenly", padding: "18px 20px", gap: "0px" });
    }
    setTimeout(fixNcmFullscreenLayout, 200);
    $(document).on("click", '#jp_ncm_widget_card, .jp-icon-btn[data-app="jp_p_ncm"]', fixNcmFullscreenLayout);

    // 物理级黑胶旋转器（无视安卓动画限制，只要音乐响就60帧丝滑旋转！）
    let jpDiscAngle = 0;
    setInterval(() => {
        if (!jpAudio.paused) {
            jpDiscAngle = (jpDiscAngle + 0.35) % 360;
            $("#jp_v_big_disc, #jp_ncm_w_disc").css("transform", `rotate(${jpDiscAngle}deg)`);
            $("#jp_vinyl_needle").css("transform", "rotate(0deg)");
        } else {
            $("#jp_vinyl_needle").css("transform", "rotate(-28deg)");
        }
    }, 30);

    jpAudio.addEventListener("timeupdate", () => {
        const curT = jpAudio.currentTime || 0, durT = jpAudio.duration || 0;
        $(".jp-ncm-cur").text(formatNcmTime(curT));
        if (durT > 0) {
            $(".jp-ncm-dur").text(formatNcmTime(durT));
            $(".ncm-prog-fill").css("width", Math.min(100, (curT / durT) * 100) + "%");
        }
        if (!jpLrcRows.length) return;
        let idx = -1;
        for (let i = 0; i < jpLrcRows.length; i++) {
            if (jpLrcRows[i].time <= curT + 0.2) idx = i; else break;
        }
        if (idx === jpLrcActiveIdx) return;
        jpLrcActiveIdx = idx;

        const start = Math.max(0, idx - 3), slice = jpLrcRows.slice(start, start + 9);
        $(lrcBoxSelector).html(slice.map((row, i) => {
            const isCur = (start + i === idx);
            const [mainLine, transLine] = row.text.split("\n");
            return `<div style="opacity:${isCur ? 1 : 0.38}; transform:scale(${isCur ? 1.06 : 0.95}); transition:all 0.25s ease;">
                <div style="font-size:${isCur ? '13.5px' : '11.5px'}; font-weight:400; color:#fff;">${mainLine || "♪"}</div>
                ${transLine ? `<div style="font-size:10px; color:rgba(255,255,255,0.65); margin-top:3px;">${transLine}</div>` : ""}
            </div>`;
        }).join(""));
    });
    
// =========================================================================
    // ✍️【第一页卡片文字内容与颜色自定义（根治版）】绝不反向覆盖输入框！
    // =========================================================================
    function applyWidgetTextsAndColor(syncInputs = false) {
        extension_settings[extName] = extension_settings[extName] || {};
        extension_settings[extName].widgetTexts = extension_settings[extName].widgetTexts || {};
        const wt = extension_settings[extName].widgetTexts;

        const c = wt.color || "#FFFFFF";
        const slide1 = $("#jp_desktop_swiper .jp-slide").first();
        slide1.css("--jp-widget-color", c);
        slide1.find(".desk-clock-box, .font-serif-italic, .font-cursive, .sync-ncm-title, #jp_pill_text_ayan").css("color", c);

        if (wt.polaName) $("#jp_polaroid_img").next().children().first().text(wt.polaName);
        if (wt.polaTag) $("#jp_polaroid_img").next().children().last().text(wt.polaTag);
        $("#jp_pill_text_ayan").text(wt.pillText || "");
        if (wt.quoteBig) slide1.find(".font-cursive").text(wt.quoteBig);
        if (wt.quoteSmall) slide1.find(".font-cursive").siblings(".font-serif-italic").text(wt.quoteSmall);

        // 只有刚开机时才同步输入框，点击保存时绝不反向覆盖你的输入框！
        if (syncInputs) {
            $("#jp_w_color_picker, #jp_w_color_hex").val(c);
            if (wt.polaName) $("#jp_in_pola_name").val(wt.polaName);
            if (wt.polaTag) $("#jp_in_pola_tag").val(wt.polaTag);
            $("#jp_in_pill_text").val(wt.pillText || "");
            if (wt.quoteBig) $("#jp_in_quote_big").val(wt.quoteBig);
            if (wt.quoteSmall) $("#jp_in_quote_small").val(wt.quoteSmall);
        }
    }

    // 先用 .off 彻底清除任何残留旧事件，再绑定实时保存
    $(document).off("click", "#jp_save_widget_texts_btn").on("click", "#jp_save_widget_texts_btn", function () {
        extension_settings[extName] = extension_settings[extName] || {};
        const wt = extension_settings[extName].widgetTexts = extension_settings[extName].widgetTexts || {};
        const card = $(this).closest(".jp-set-card");

        const hex = card.find("#jp_w_color_hex").val().trim();
        const pick = card.find("#jp_w_color_picker").val();
        wt.color = hex || pick || "#FFFFFF";

        const pName = card.find("#jp_in_pola_name").val().trim();
        const pTag = card.find("#jp_in_pola_tag").val().trim();
        const pText = card.find("#jp_in_pill_text").val().trim();
        const qBig = card.find("#jp_in_quote_big").val().trim();
        const qSmall = card.find("#jp_in_quote_small").val().trim();

        if (pName) wt.polaName = pName;
        if (pTag) wt.polaTag = pTag;
        wt.pillText = pText;
        if (qBig) wt.quoteBig = qBig;
        if (qSmall) wt.quoteSmall = qSmall;

        saveSettingsDebounced();
        applyWidgetTextsAndColor(false);
        toastr.success("文字与颜色已成功修改并永久保存！✍️✨");
    });

    $(document).off("input change", "#jp_w_color_picker").on("input change", "#jp_w_color_picker", function () {
        $("#jp_w_color_hex").val($(this).val());
    });

    setTimeout(() => applyWidgetTextsAndColor(true), 400);
    $(document).on("click", "#lime_phone_entry_btn, .jp-btn-back, .jp-homebar", () => {
        setTimeout(() => applyWidgetTextsAndColor(false), 50);
    }); 
    
    // =========================================================================
    // 📓【App 模块：池衿宴的记仇本】三红点前奏、永久保存、AI 逐条追加接口
    // =========================================================================
    function ensureGrudgeData() {
        extension_settings[extName] = extension_settings[extName] || {};
        extension_settings[extName].grudgeData = Object.assign({
            records: [], // 初始保持空白，等待阿宴生成或手动录入
            filter: "all",
            currentIdx: 0
        }, extension_settings[extName].grudgeData || {});
        return extension_settings[extName].grudgeData;
    }

    function renderGrudgeApp() {
        const gd = ensureGrudgeData();
        const records = Array.isArray(gd.records) ? gd.records : [];
        const unsettledCount = records.filter(r => !r.settled).length;

        $("#g_unsettled_count").text(String(unsettledCount).padStart(2, "0"));
        $("#g_total_count").text(`${unsettledCount} 条`);
        $("#g_month_tip").text(`+${String(records.length).padStart(2, "0")} 笔已记录 ↗`);
        $("#g_folio_no").text(`FOLIO / ${String(records.length).padStart(3, "0")}`);

        // 更新前奏页小红点文字
        if (records.length > 0) {
            $("#g_radar_text").text(`“阿宴刚刚在小本本记了第 ${records.length} 笔：《${records[0].title}》……”`);
        } else {
            $("#g_radar_text").text("“阿宴正眯着眼暗中观察，小本本随时准备记下第一笔……”");
        }

        const box = $("#g_records_box");
        const filtered = records.map((r, idx) => ({ r, idx })).filter(({ r }) => {
            if (gd.filter === "pending") return !r.settled;
            if (gd.filter === "settled") return r.settled;
            return true;
        });

        if (!filtered.length) {
            box.html(`<div style="text-align:center; padding:36px 12px; color:#7E8F9F; font-size:11.5px; background:#fff; border:1px dashed #b8d2f7; border-radius:10px; margin:8px 0;">账本暂空 · 等待阿宴亲笔录入违约记录 ✨</div>`);
            return;
        }

        box.html(filtered.map(({ r, idx }) => {
            const lv = Math.min(3, Math.max(1, Number(r.level) || 2));
            const stars = "✦".repeat(lv) + "✧".repeat(3 - lv);
            const isSet = Boolean(r.settled);
            return `
              <div class="g-entry" data-gidx="${idx}">
                <div class="g-between">
                  <span class="g-sub-tag" style="color:${isSet ? '#7E8F9F' : '#5B87DE'};">NO. ${r.no || '001'} · ${r.type || '亲昵违约'}</span>
                  <span class="g-muted" style="font-size:10.5px;">${r.date || '刚刚'}</span>
                </div>
                <div class="g-entry-title" style="${isSet ? 'color:#7E8F9F; text-decoration:line-through;' : ''}">${r.title || '未命名违约'}</div>
                <div class="g-between">
                  <span class="g-muted" style="font-size:11px;">清算权重　${stars}</span>
                  <span class="g-amount-badge" style="${isSet ? 'color:#7E8F9F;' : ''}">${r.amount || '连本带利'}</span>
                </div>
                <div class="g-divider" style="margin:7px 0;"></div>
                <div class="g-between g-muted" style="font-size:10.5px;">
                  <span class="g-claim-tag ${isSet ? 'settled' : 'pending'}">${isSet ? '✓ 已在床上结清' : '● 待肉偿执行'}</span>
                  <span style="color:#5B87DE; font-weight:500;">翻阅案卷 →</span>
                </div>
              </div>`;
        }).join(""));
    }

    // 核心接口：供后续 AI 生成后自动一条一条塞进记仇本并永久保存！
    window.addGrudgeFromAI = function (item) {
        if (!item || typeof item !== "object") return;
        const gd = ensureGrudgeData();
        const title = item.title || "突发违约";
        const type = item.type || "独占逾矩";
        const complaint = item.complaint || "“又不乖了。”";
        const body = item.body || "";
        const key = wvMakeKey("grudge", [title, type, complaint, body]);
        const existing = gd.records.find(r => r._wvKey === key || wvMakeKey("grudge", [r.title || "", r.type || "", r.complaint || "", r.body || ""]) === key);
        const nextNo = String(gd.records.length + 1).padStart(3, "0");
        const lv = Math.min(3, Math.max(1, parseInt(String(item.level || "2").match(/\d/)?.[0] || 2)));
        const updated = {
            title, type, level: lv, complaint, body,
            judgment: item.judgment || "当场扣押，等待清算。",
            remedy: item.remedy || "今夜在主卧连本带利讨清。",
            amount: item.amount || "违约欠款 · 连本带利",
            quote: item.quote || "账本又添了一行，池太太准备好怎么还了么？",
            _wvKey: key
        };
        if (existing) {
            Object.assign(existing, updated);
            if (!existing.no) existing.no = item.no || nextNo;
            if (!existing.date) existing.date = item.date || "刚刚 · 亲笔入卷";
            // 保留用户已经手动设置的结清状态
        } else {
            gd.records.unshift({
                no: item.no || nextNo,
                date: item.date || "刚刚 · 亲笔入卷",
                ...updated,
                settled: false
            });
        }
        saveSettingsDebounced();
        renderGrudgeApp();
    };
// 点击小红点：卡片底边永远停在红点正上方（绝不挡红点），再点一下消失！
    $(document).on("click", ".g-dot-marker", function () {
        $(".g-dot-marker").first().css("top", "38%");
        const card = $("#g_radar_card");
        if (card.is(":visible") && card.data("activeDot") === this) {
            card.fadeOut(150).data("activeDot", null);
            return;
        }
        const dotTop = parseFloat(this.style.top) || 40;
        card.data("activeDot", this).css({ top: (dotTop - 3.5) + "%", transform: "translateY(-100%)" }).fadeIn(180);
        $("#g_radar_text").text(`“${$(this).data("hint")}”`);
    });

// 从第一层点进第二层【私藏账本列表】
$(document).on("click", ".g-open-ledger-btn", () => {
    $("#grudge_v_radar").addClass("g-hidden");
    $("#grudge_v_main").removeClass("g-hidden");
    $("#g_sub_home").removeClass("g-hidden");
    $("#g_sub_detail, #g_sub_new").addClass("g-hidden");
    renderGrudgeApp();
});
$(document).on("click", "#g_back_to_radar", () => {
    $("#grudge_v_main").addClass("g-hidden");
    $("#grudge_v_radar").removeClass("g-hidden");
});

// 列表筛选、点开详情、标记结清、手动补录
$(document).on("click", "[data-gfilter]", function () {
    const gd = ensureGrudgeData();
    gd.filter = $(this).data("gfilter");
    $("[data-gfilter]").removeClass("active");
    $(this).addClass("active");
    renderGrudgeApp();
});

$(document).on("click", ".g-entry", function () {
    const gd = ensureGrudgeData();
    const idx = Number($(this).data("gidx")) || 0;
    gd.currentIdx = idx;
    const r = gd.records[idx];
    if (!r) return;
    const lv = Math.min(3, Math.max(1, Number(r.level) || 2));
    $("#gd_no").text(`EXCLUSIVE FOLIO / NO. ${r.no}`);
    $("#gd_title").text(r.title);
    $("#gd_date").text(`${r.date} · ${r.type}`);
    $("#gd_complaint").text(r.complaint);
    $("#gd_body").text(r.body);
    $("#gd_judgment").text(r.judgment);
    $("#gd_level").text(`执罚等级　${"✦".repeat(lv)}${"✧".repeat(3 - lv)}`);
    $("#gd_remedy").text(r.remedy);
    $("#gd_quote").text(r.quote);
    $("#gd_settle_btn").text(r.settled ? "✓ 此笔债务已彻底讨回" : "标记执行：这笔账已在床上讨回").prop("disabled", Boolean(r.settled));
    $("#g_sub_home, #g_sub_new").addClass("g-hidden");
    $("#g_sub_detail").removeClass("g-hidden");
});

$(document).on("click", "#gd_settle_btn", () => {
    const gd = ensureGrudgeData();
    if (gd.records[gd.currentIdx]) {
        gd.records[gd.currentIdx].settled = true;
        saveSettingsDebounced();
        renderGrudgeApp();
        $("#gd_settle_btn").text("✓ 此笔债务已彻底讨回").prop("disabled", true);
    }
});

$(document).on("click", "#g_back_home_1, #g_back_home_2", () => {
    $("#g_sub_detail, #g_sub_new").addClass("g-hidden");
    $("#g_sub_home").removeClass("g-hidden");
    renderGrudgeApp();
});
$(document).on("click", "#g_go_new_btn", () => {
    $("#g_sub_home").addClass("g-hidden");
    $("#g_sub_new").removeClass("g-hidden");
});
$(document).on("click", "#g_save_new_btn", () => {
    const title = $("#g_in_title").val().trim();
    const body = $("#g_in_body").val().trim();
    const remedy = $("#g_in_remedy").val().trim();
    if (!title && !body) return toastr.warning("请先填写违约标题或事由哦！");
    window.addGrudgeFromAI({ title: title || body.slice(0, 12), body: body || title, remedy });
    $("#g_in_title, #g_in_body, #g_in_remedy").val("");
    $("#g_sub_new").addClass("g-hidden");
    $("#g_sub_home").removeClass("g-hidden");
    toastr.success("已录入私藏账本并永久保存！📓✨");
});
  // =========================================================================
    // 🛍️【App 模块：NET-A-PORTER 私人百货】EIP 001 隐藏调色、智能线稿匹配、AI 接口
    // =========================================================================
    function ensureNapData() {
        extension_settings[extName] = extension_settings[extName] || {};
        extension_settings[extName].napData = Object.assign({
            accent: "#28517F",
            contrast: "#C7E1FA",
            bag: [],    // 初始保持空白，等待 AI 正则生成
            orders: []  // 初始保持空白，等待 AI 正则生成或结算转入
        }, extension_settings[extName].napData || {});
        return extension_settings[extName].napData;
    }

    // 智能识别商品名自动匹配杂志级细线 SVG 插画（无需 AI 画图！）
    function getNapSvgArt(brand, name) {
        const text = `${brand || ""} ${name || ""}`;
        if (/0\.01|套|私密|避孕|Sagami|冈本|护理|润滑|束带|眼罩/i.test(text)) {
            return `<svg viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="18" y="26" width="44" height="48" rx="3"/><line x1="18" y1="42" x2="62" y2="42"/><circle cx="40" cy="58" r="8"/><text x="40" y="37" text-anchor="middle" font-size="6.5" fill="currentColor" stroke="none" letter-spacing="1">0.01 · L</text></svg>`;
        }
        if (/包|手袋|Kelly|Birkin|Herm|Chanel|Dior|皮/i.test(text)) {
            return `<svg viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M18 36 L62 36 L66 82 L14 82 Z"/><path d="M28 36 C28 18 52 18 52 36"/><path d="M16 50 L64 50 M36 46 L44 46 L44 55 L36 55 Z"/></svg>`;
        }
        if (/鞋|高跟|靴|Caovilla|Choo|Louboutin/i.test(text)) {
            return `<svg viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="1.3" stroke-linecap="round"><path d="M18 42 C24 62 42 74 64 74 C66 66 56 60 46 58 C34 55 28 42 22 38 Z"/><path d="M22 54 L22 76 M24 34 Q36 38 42 32"/></svg>`;
        }
        if (/钻|项链|戒|冠冕|表|珠宝|Chaumet|Cartier|宝/i.test(text)) {
            return `<svg viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="1.3"><circle cx="40" cy="58" r="18"/><polygon points="40 24 48 34 40 42 32 34"/></svg>`;
        }
        if (/香|油|膏|肤|Buly|烛/i.test(text)) {
            return `<svg viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="1.3"><rect x="26" y="34" width="28" height="48" rx="3"/><path d="M35 34 L35 24 L45 24 L45 34 M31 24 L49 24"/><rect x="31" y="46" width="18" height="22"/></svg>`;
        }
        return `<svg viewBox="0 0 80 100" fill="none" stroke="currentColor" stroke-width="1.3"><path d="M30 18 C34 25 46 25 50 18 L55 38 L64 86 L16 86 L25 38 Z"/><path d="M25 38 Q40 44 55 38 M31 18 L29 8 M49 18 L51 8"/></svg>`;
    }

    function hexToRgbaLine(hex, alpha) {
        const clean = String(hex || "#28517F").replace("#", "");
        const n = parseInt(clean, 16);
        if (isNaN(n)) return "rgba(40,81,127,0.18)";
        return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
    }

    function renderNapApp() {
        const nd = ensureNapData();
        const page = $("#jp_p_nap");
        page.css({
            "--nap-accent": nd.accent || "#28517F",
            "--nap-contrast": nd.contrast || "#C7E1FA",
            "--nap-line": hexToRgbaLine(nd.accent, 0.19)
        });

        $("#nap_in_accent_pick, #nap_in_accent_hex").val(nd.accent || "#28517F");
        $("#nap_in_contrast_pick, #nap_in_contrast_hex").val(nd.contrast || "#C7E1FA");

        const bag = Array.isArray(nd.bag) ? nd.bag : [];
        const orders = Array.isArray(nd.orders) ? nd.orders : [];
        const fmtMoney = (n) => "¥ " + (Number(n) || 0).toLocaleString("en-US");

        // 渲染购物袋
        const pBox = $("#nap_products_box");
        if (!bag.length) {
            pBox.html(`<div style="text-align:center; padding:38px 10px; color:#929BA5; font-size:11px; border-bottom:1px solid var(--nap-line);">私人购物袋暂空 · 等待 Mr. Chi 甄选入袋</div>`);
            $("#nap_bag_count").text("共 00 件");
            $("#nap_subtotal, #nap_total").text("¥ 0");
        } else {
            let sumCount = 0, sumPrice = 0;
            pBox.html(bag.map((p, i) => {
                const qty = Math.max(1, Number(p.qty) || 1);
                const price = Number(p.price) || 0;
                sumCount += qty;
                sumPrice += price * qty;
                return `
                  <article class="nap-product">
                    <div class="nap-art">${getNapSvgArt(p.brand, p.name)}<small>${p.size || "专属定制"}</small></div>
                    <div class="nap-info">
                      <div class="nap-brand-row"><span class="nap-brand">${p.brand || "PRIVATE ATELIER"}</span><span class="nap-price">${fmtMoney(price)}</span></div>
                      <div class="nap-name">${p.name || "甄选单品"}</div>
                      <div class="nap-note">${p.note || ""}</div>
                      <div class="nap-product-foot">
                        <div class="nap-stepper"><button data-napminus="${i}">−</button><span>${qty}</span><button data-napplus="${i}">＋</button></div>
                        <button class="nap-remove" data-naprm="${i}">移出清单</button>
                      </div>
                    </div>
                  </article>`;
            }).join(""));
            $("#nap_bag_count").text(`共 ${String(sumCount).padStart(2, "0")} 件`);
            $("#nap_subtotal, #nap_total").text(fmtMoney(sumPrice));
        }

        // 渲染采购档案
        const oBox = $("#nap_orders_box");
        if (!orders.length) {
            oBox.html(`<div style="text-align:center; padding:38px 10px; color:#929BA5; font-size:11px;">暂无历史采购档案 · 等待生成刷新</div>`);
        } else {
            oBox.html(orders.map(o => `
              <article class="nap-order">
                <div class="nap-order-top"><span class="nap-order-no">订单号 · ${o.no || "NP-0119"}</span><span class="nap-status">${o.status || "同城隐私专车闪送中"}</span></div>
                <div class="nap-order-name">${o.name || "私人百货定制单"}</div>
                <div class="nap-order-desc">${o.desc || "池先生指令：免除管家拆检，直接送入主卧"} · <b>${fmtMoney(o.price)}</b></div>
                <div class="nap-archive">${o.archive || "签收记录：已由 Mr. Chi 本人核验 · 归入私人百货档案"}</div>
              </article>`).join(""));
        }
    }
    // 预留给后续全局 AI 正则生成器的接口！
window.updateNapFromAI = function (payload) {
    const nd = ensureNapData();
    if (Array.isArray(payload?.bag)) nd.bag = payload.bag;
    if (Array.isArray(payload?.orders) && payload.orders.length) {
        const orders = Array.isArray(nd.orders) ? nd.orders : [];
        payload.orders.forEach(order => {
            const key = wvMakeKey("nap-order", order.no ? [order.no] : [order.name || "", order.price || 0, order.desc || "", order.archive || ""]);
            const existing = orders.find(o => o._wvKey === key || wvMakeKey("nap-order", o.no ? [o.no] : [o.name || "", o.price || 0, o.desc || "", o.archive || ""]) === key);
            if (existing) Object.assign(existing, order, { _wvKey: key });
            else orders.unshift({ ...order, _wvKey: key });
        });
        nd.orders = orders.slice(0, 5);
    }
    saveSettingsDebounced();
    renderNapApp();
};

$(document).on("click", '.jp-icon-btn[data-app="jp_p_nap"]', () => renderNapApp());

// 点击底部导航切换 购物袋 / 采购档案
$(document).on("click", "#jp_p_nap .nap-tab", function () {
    const target = $(this).data("nappage");
    $("#jp_p_nap .nap-tab").removeClass("active");
    $(this).addClass("active");
    $("#jp_p_nap .nap-subpage").removeClass("active");
    $(`#nap_page_${target}`).addClass("active");
});

// 购物袋数量增减、移除与确认结算
$(document).on("click", "[data-napplus]", function () {
    const nd = ensureNapData();
    const i = Number($(this).data("napplus"));
    if (nd.bag[i]) { nd.bag[i].qty = (Number(nd.bag[i].qty) || 1) + 1; saveSettingsDebounced(); renderNapApp(); }
});
$(document).on("click", "[data-napminus]", function () {
    const nd = ensureNapData();
    const i = Number($(this).data("napminus"));
    if (nd.bag[i]) { nd.bag[i].qty = Math.max(1, (Number(nd.bag[i].qty) || 1) - 1); saveSettingsDebounced(); renderNapApp(); }
});
$(document).on("click", "[data-naprm]", function () {
    const nd = ensureNapData();
    nd.bag.splice(Number($(this).data("naprm")), 1);
    saveSettingsDebounced();
    renderNapApp();
});
$(document).on("click", "#nap_consult_btn", () => {
    $("#nap_notice_tip").text("✓ 已向 EIP 私人买手发送指令，今夜将由专车私密送达主卧。");
});

// 🕵️‍♀️ 秘密机关：点击右上角 EIP 001 打开隐藏调色面板
$(document).on("click", "#nap_secret_eip_btn", () => $("#nap_color_modal").css("display", "flex"));
$(document).on("click", "#nap_close_color_modal", () => $("#nap_color_modal").hide());
$(document).on("click", ".nap-preset-btn", function () {
    $("#nap_in_accent_pick, #nap_in_accent_hex").val($(this).data("a"));
    $("#nap_in_contrast_pick, #nap_in_contrast_hex").val($(this).data("b"));
});
$(document).on("input change", "#nap_in_accent_pick", function () { $("#nap_in_accent_hex").val($(this).val()); });
$(document).on("input change", "#nap_in_contrast_pick", function () { $("#nap_in_contrast_hex").val($(this).val()); });
$(document).on("click", "#nap_save_custom_color", () => {
    const nd = ensureNapData();
    nd.accent = $("#nap_in_accent_hex").val().trim() || "#28517F";
    nd.contrast = $("#nap_in_contrast_hex").val().trim() || "#C7E1FA";
    saveSettingsDebounced();
    renderNapApp();
    $("#nap_color_modal").hide();
    toastr.success("私人百货配色已永久保存！🛍️✨");
});
    
        // =========================================================================
    // 🌐【App 模块：ORBIS 私人浏览器 (1/2)】初始空白数据与双模式渲染
    // =========================================================================
    function ensureBrowserData() {
        extension_settings[extName] = extension_settings[extName] || {};
        extension_settings[extName].browserData = Object.assign({
            isSecret: false,
            briefing: { title: "", desc: "" },
            normal: [], // 初始保持空白，等待 AI 正则生成或手动搜索
            secret: []  // 初始保持空白，等待 AI 正则生成或手动搜索
        }, extension_settings[extName].browserData || {});
        return extension_settings[extName].browserData;
    }

    function renderBrowserApp() {
        const bd = ensureBrowserData();
        $("#orb_briefing_title").text(bd.briefing?.title || "全球商业终端待命");
        $("#orb_briefing_desc").text(bd.briefing?.desc || "等待生成刷新阿宴今日的跨国并购简报与私人备忘 ✨");

        // 1. 渲染常规商务搜索列表（空则显示优雅占位）
        const nBox = $("#orb_normal_records");
        const nList = Array.isArray(bd.normal) ? bd.normal : [];
        if (!nList.length) {
            nBox.html(`<div style="text-align:center; padding:36px 12px; color:#8C99A8; font-size:11px; border:0.8px dashed #E2E8F0; border-radius:8px; margin-top:4px;">暂无近期商务检索 · 等待阿宴生成刷新 ✨</div>`);
        } else {
            nBox.html(nList.map((item, i) => `
              <div class="orb-record">
                <div class="orb-record-no">${String(i + 1).padStart(2, "0")}</div>
                <div>
                  <div class="orb-record-title">${item.title || "商业检索"}</div>
                  <div class="orb-record-desc">${item.desc || "ORBIS 加密商业终端 · 实时归档"}</div>
                </div>
                <div class="orb-record-date">${item.date || "刚刚"}</div>
              </div>`).join(""));
        }

        // 2. 渲染深夜无痕检索列表（空则显示优雅占位，有则盖上 5 秒薄雾）
        const sBox = $("#orb_secret_results");
        const sList = Array.isArray(bd.secret) ? bd.secret : [];
        $("#orb_secret_count").text(`INCOGNITO CACHE · ${String(sList.length).padStart(2, "0")}`);
        const veils = [
            ["#f3dce9", "#e9eafa"], ["#f6e8f0", "#e9eafa"],
            ["#f3dce9", "#eaeafa"], ["#e9eafa", "#f6e8f0"]
        ];
        if (!sList.length) {
            sBox.html(`<div style="text-align:center; padding:38px 12px; color:#C4B1C7; font-size:11px; border:1px dashed #EBDFEB; border-radius:8px; background:rgba(255,255,255,0.6);">暂无未销毁的隐秘检索 · 等待生成刷新 ✨</div>`);
        } else {
            sBox.html(sList.map((item, i) => {
                const [va, vb] = veils[i % veils.length];
                return `
                  <article class="orb-result" style="--veil-a:${va};--veil-b:${vb}">
                    <div class="orb-result-head">
                      <div class="orb-type"><i></i>INCOGNITO QUERY · ${item.type || "私密检索"}</div>
                      <div class="orb-date">${item.date || "TONIGHT"}</div>
                    </div>
                    <div class="orb-query-line"><span class="orb-query-text">${item.query || ""}</span><span class="orb-mask"></span></div>
                    <div class="orb-answer-label">SEARCH ENGINE PREVIEW · 检索摘要</div>
                    <div class="orb-answer-wrap">${item.answer || "已通过加密通道提交私密检索，等待生成引擎深度匹配摘要……"}<span class="orb-mask"></span></div>
                    <div class="orb-footer"><span>加密检索 · ${item.count || 9} 条相关词条</span><span class="orb-hint">轻触显影 · 阅后即焚</span></div>
                  </article>`;
            }).join(""));
        }
    }
        // =========================================================================
    // 🌐【App 模块：ORBIS 私人浏览器 (2/2)】AI 正则替换接口与交互事件
    // =========================================================================
    window.updateBrowserFromAI = function (payload) {
        if (!payload || typeof payload !== "object") return;
        const bd = ensureBrowserData();
        if (payload.briefing && (payload.briefing.title || payload.briefing.desc)) {
            bd.briefing = { title: payload.briefing.title || bd.briefing.title, desc: payload.briefing.desc || bd.briefing.desc };
        }
        const mergeRecords = (incoming, current, type, fields) => {
            if (!Array.isArray(incoming) || !incoming.length) return current || [];
            const records = Array.isArray(current) ? current : [];
            incoming.forEach(item => {
                const key = wvMakeKey(type, fields.map(field => item[field] ?? ""));
                const existing = records.find(x => x._wvKey === key || wvMakeKey(type, fields.map(field => x[field] ?? "")) === key);
                if (existing) Object.assign(existing, item, { _wvKey: key });
                else records.unshift({ ...item, _wvKey: key });
            });
            return records.slice(0, 15);
        };
        bd.normal = mergeRecords(payload.normal, bd.normal, "browser-normal", ["title", "desc", "date"]);
        bd.secret = mergeRecords(payload.secret, bd.secret, "browser-secret", ["type", "date", "query", "answer", "count"]).slice(0, 10);
        saveSettingsDebounced();
        renderBrowserApp();
    };
    // 核心正则解析器：自动匹配 AI 返回的 [简报|...] [日常搜索|...] [无痕搜索|...] 标签并替换显示！
    window.parseBrowserFromAI = function (rawText) {
        const text = String(rawText || "");
        const payload = { briefing: null, normal: [], secret: [] };
        const bMatch = text.match(/\[(?:简报|BROWSER_BRIEFING)\s*[|｜]\s*([^|｜\]\n]+)\s*[|｜]\s*([^\]]+)\]/i);
        if (bMatch) payload.briefing = { title: bMatch[1].trim(), desc: bMatch[2].trim() };

        const nReg = /\[(?:日常搜索|BROWSER_NORMAL)\s*[|｜]\s*([^|｜\]\n]+)\s*[|｜]\s*([^|｜\]\n]+)(?:\s*[|｜]\s*([^\]]+))?\]/gi;
        let m;
        while ((m = nReg.exec(text)) !== null) {
            payload.normal.push({ title: m[1].trim(), desc: m[2].trim(), date: (m[3] || "刚刚").trim() });
        }
        const sReg = /\[(?:无痕搜索|BROWSER_SECRET)\s*[|｜]\s*([^|｜\]\n]+)\s*[|｜]\s*([^|｜\]\n]+)\s*[|｜]\s*([^|｜\]\n]+)\s*[|｜]\s*([^|｜\]\n]+)(?:\s*[|｜]\s*([^\]]+))?\]/gi;
        while ((m = sReg.exec(text)) !== null) {
            payload.secret.push({ type: m[1].trim(), date: m[2].trim(), query: m[3].trim(), answer: m[4].trim(), count: parseInt(m[5]) || 12 });
        }
        if (payload.briefing || payload.normal.length || payload.secret.length) window.updateBrowserFromAI(payload);
    };

    function applyBrowserModeUI() {
        const bd = ensureBrowserData();
        const sec = Boolean(bd.isSecret);
        $("#orb_btn_toggle_mode").toggleClass("secret", sec);
        $("#orb_mode_label").text(sec ? "退出即焚" : "日常商务");
        $("#orb_mode_icon").html(sec
            ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/><line x1="1" y1="1" x2="23" y2="23"/>'
            : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/><circle cx="12" cy="12" r="3"/>');
        $("#orb_dock_secret").css("color", sec ? "#846890" : "#475569");
        $("#orb_brand_main").text(sec ? "NAVIGATION PRIVÉE" : "ACCÈS MONDIAL").css("color", sec ? "#826D8C" : "var(--moon-accent)");
        $("#orb_brand_sub").text(sec ? "INCOGNITO · BURN ON EXIT" : "MR. CHI · NAVIGATION").css("color", sec ? "#BBAEC3" : "var(--moon-muted)");
        $("#orb_global_url_bar").css("display", sec ? "none" : "flex");
        $("#orb_view_normal").css({ opacity: sec ? 0 : 1, pointerEvents: sec ? "none" : "auto", transform: sec ? "scale(0.97)" : "scale(1)" });
        $("#orb_view_secret").css({ opacity: sec ? 1 : 0, pointerEvents: sec ? "auto" : "none", transform: sec ? "scale(1)" : "scale(0.97)" });
        if (sec) $("#orb_secret_results .orb-result").removeClass("revealed").find(".orb-hint").text("轻触显影 · 阅后即焚");
    }

    $(document).off(".jpbrowser")
        .on("click.jpbrowser", '.jp-icon-btn[data-app="jp_p_browser"]', () => { renderBrowserApp(); applyBrowserModeUI(); })
        .on("click.jpbrowser", "#orb_btn_toggle_mode, #orb_dock_secret, #orb_dock_switch", () => { const bd = ensureBrowserData(); bd.isSecret = !bd.isSecret; saveSettingsDebounced(); applyBrowserModeUI(); })
        .on("click.jpbrowser", "#orb_secret_results .orb-result", function () {
            const open = !$(this).hasClass("revealed");
            $("#orb_secret_results .orb-result").removeClass("revealed").find(".orb-hint").text("轻触显影 · 阅后即焚");
            if (open) {
                const el = $(this).addClass("revealed");
                el.find(".orb-hint").text("雾气消散中……");
                setTimeout(() => { if (el.hasClass("revealed")) el.find(".orb-hint").text("痕迹已显露 · 退出即焚"); }, 5200);
            }
        })
        .on("click.jpbrowser", "#orb_normal_search_btn", () => { const v = $("#orb_normal_input").val().trim(); if (v) { window.updateBrowserFromAI({ normal: [{ title: v, desc: "手动商业检索 · 私人终端归档", date: "刚刚" }] }); $("#orb_normal_input").val(""); } })
        .on("click.jpbrowser", "#orb_secret_search_btn", () => { const v = $("#orb_secret_input").val().trim(); if (v) { window.updateBrowserFromAI({ secret: [{ type: "实时无痕", date: "JUST NOW", query: v, answer: "已通过加密通道提交私密检索，等待生成引擎深度匹配摘要……", count: 8 }] }); $("#orb_secret_input").val(""); } })
        .on("click.jpbrowser", "#orb_clear_normal", () => { ensureBrowserData().normal = []; saveSettingsDebounced(); renderBrowserApp(); })
        .on("click.jpbrowser", "#orb_dock_clear_secret", () => { ensureBrowserData().secret = []; saveSettingsDebounced(); renderBrowserApp(); toastr.info("无痕检索缓存已焚毁 ✧"); });
      
        
// =========================================================================
    // 📜【App 模块：织章 · Weave (1/2)】内置黄金模板、真数据底盘与 5 栏渲染
    // =========================================================================
    const WV_ICONS = {
        xhs: `<svg viewBox="0 0 24 24"><rect x="4" y="3" width="16" height="18" rx="3"/><path d="M12 15.5C12 15.5 8.5 13 8.5 10.8C8.5 9.6 9.4 8.8 10.5 8.8C11.2 8.8 11.7 9.2 12 9.7C12.3 9.2 12.8 8.8 13.5 8.8C14.6 8.8 15.5 9.6 15.5 10.8C15.5 13 12 15.5 12 15.5Z" fill="currentColor" stroke="none"/></svg>`,
        browser: `<svg viewBox="0 0 24 24"><circle cx="12" cy="12" r="9"/><path d="M3.6 9h16.8M3.6 15h16.8"/><path d="M11.5 3a17 17 0 0 0 0 18M12.5 3a17 17 0 0 1 0 18"/></svg>`,
        grudge: `<svg viewBox="0 0 24 24"><path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20"/><path d="M6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15A2.5 2.5 0 0 1 6.5 2z"/><path d="M12 7v5l3 2"/></svg>`,
        wallet: `<svg viewBox="0 0 24 24"><rect x="3" y="5" width="18" height="14" rx="3"/><path d="M3 9.5H21"/><circle cx="16.5" cy="14" r="1.5" fill="currentColor"/></svg>`,
        nap: `<svg viewBox="0 0 24 24"><path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"/><path d="M3 6h18"/><path d="M16 10a4 4 0 0 1-8 0"/></svg>`,
        forum: `<svg viewBox="0 0 24 24"><path d="M4 5h16v12H9l-5 3zM8 9h8M8 13h5"/></svg>`,
        regex: `<svg viewBox="0 0 24 24"><path d="M5 5h14M3 8h4M3 16h4M12 5l7 14M19 5l-7 14"/></svg>`,
        trash: `<svg viewBox="0 0 24 24"><path d="M3 6h18M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/><line x1="10" y1="11" x2="10" y2="17"/><line x1="14" y1="11" x2="14" y2="17"/></svg>`
    };

    // ✍️ 织章内置指令：各软件完整指令分别贴进对应的反引号之间
const WV_P_XHS = String.raw`【小红书生成指令】
请以「池衿宴」本人的视角，结合当前剧情与两人刚发生的互动或者过往回忆，生成 1 篇池衿宴发布的小红书笔记。

【题材变化规则】
每次生成都要根据当前剧情寻找不同的记录切口，不要把“赖床、拥抱、主卧、暖炉、睡衣、床头”等当作默认题材。可在商业日常、工作间隙、收藏与艺术、出行见闻、餐饮与生活、礼物、夫妻互动、居家琐事等方向中灵活选择；连续生成时主动更换叙事场景、事件类型和表达方式，避免只替换标题或物品名称、实质内容却高度相似。不要为了凑题材而编造当前剧情中不存在的重大事件。

<字段描写要求（请先仔细阅读每一项该写什么）>
1. 笔记标题：简短有质感（15字以内），符合池衿宴角色性格，不要像营销号。
2. 笔记正文：以第一人称“我”撰写（不少于50字，可用 \n 分段）。池衿宴的小红书粉丝520.1w，关注仅老婆绛绛1人。他有时发商业营业，有时候记录与绛绛的甜蜜日常，例如：事后她熟睡在怀里的侧影、落在他高定西装或床头的长发与衣物、为她拍下的藏品、或她耍小性子被他哄好的日常碎片。
3. 话题标签：2到4个以 # 开头的话题标签，用空格隔开。
4. 点赞数：符合他的身份的热度，格式如 68.5w 或 102.3w。

<严格输出格式如下（必须包含方括号与竖线，不得遗漏）>
[小红书|此处填笔记标题|此处填笔记正文|此处填#话题标签|此处填点赞数]

格式示例(禁止照抄)：[小红书|某人赖床的第三个小时|昨晚明明说好只看半场电影，最后还是在我怀里折腾到凌晨。\n早上日内瓦的跨国视频会不得不推迟了半小时，罪魁祸首现在还攥着我的衬衫领口睡得人事不省。|#夫妻日常 #独家视角 #早安|92.6w]`;

    const WV_P_WALLET = String.raw`【私人钱包生成指令】
请以「池衿宴」的私人黑卡视角，结合当前剧情、日常开销与他的商业版图，生成 5 条近期流动资产收支明细（包含但不限于绛绛的副卡消费、他为绛绛花钱的支出、或他名下乳业集团与离岸信托的入账以及其他生活日常支出）。内容偏好：必须有生活感，真实。

<字段描写要求>
1. 账单名称：简短真实（15字以内），符合豪门日常与宠妻细节。
2. 账单金额：必须只写纯数字（支出前面加负号 -，入账前面加正号 +，严禁出现逗号、人民币符号或“万”字，以便系统自动算账）。
3. 时间与备注：简短注明时间与支付渠道。

<严格输出格式与正确示例（必须输出 5 条，包含方括号与竖线）>
[账单|此处填账单名称|此处填纯数字正负金额|此处填时间与备注]

格式示例(禁止照抄)：[账单|欧洲乳业集团第三季度分红|+26000000|今天 11:00 · 日内瓦私行入账]`;

    const WV_P_GRUDGE = String.raw`【记仇本生成指令】
请以「池衿宴」本人的私密视角，结合当前剧情或两人相处细节，在他的私藏账本中录入 1 笔针对绛绛的“违约记仇案卷”（池衿宴对旁人从不屑记仇，唯独对老婆绛绛的各种小动作、敷衍、躲避亲密、不按时吃饭睡觉或多看别人一眼都会一笔笔暗中记下，留作床头账连本带利讨回）。内容偏好：有趣吸引绛绛。

<字段描写要求>
1. 违约标题：简短有画面感（10字以内），如“逃逸的早安吻”、“敷衍的晚安语音”、“未报备的半小时”等，根据内容自由发挥。
2. 违约类型：用4个字定性，如“亲昵违约”、“独占逾矩”、“作息违约”、“视线越界”等，根据内容自由发挥。
3. 执罚等级：只写纯数字 1、2 或 3（数字越大代表他越想在床上重罚）。
4. 契约事由·控诉：由池衿宴本人亲口对绛绛说出的控诉台词，直接表达他对这次违约行为的不满、质问、醋意或委屈。必须使用第一人称对话口吻，像当面说给绛绛听的一句话；可以是疑问、反问或陈述句。**严格限制在15个汉字以内（标点不计），必须短促、有针对性；不得通过逗号或分句变相延长。**不得写成旁白、心理描写或客观事件总结。
5. 契约事由·经过：从池衿宴的视角，具体、清楚地描述绛绛这次究竟做了什么、发生了什么，细节真实生动（40字以上）。这一栏写事件经过，不要重复控诉台词，也不要写成对话。
6. 私人仲裁：池衿宴单方面下达的裁决结论，如“驳回一切撒娇抗议，记录在案，今夜执行清算”等，根据剧情自由发挥。
7. 索偿条款：具体要求绛绛如何偿还这笔账，符合池衿宴斯文、偏执、占有欲强的性格，可围绕亲密相处、温存或主卧内的约定展开。
8. 私语留档：池衿宴在案卷末尾亲笔留给池太太的一句低沉危险或宠溺的原话。

<严格输出格式与正确示例（必须输出 1 条，包含方括号与竖线）>
[记仇|此处填违约标题|此处填违约类型|此处填执罚等级数字|此处填契约事由·控诉台词|此处填契约事由·经过|此处填私人仲裁|此处填索偿条款|此处填私语留档]

格式示例(禁止照抄)：[记仇|擅自终止的拥抱|借温毁约|2|谁准你先从我腿上下去的？|在书房未经允许跨坐上来取暖，双手把玩我的领带，身子刚焐热就毫无留恋地抽身想走。你口称“怕打扰我工作”，实则用完就弃，连一句解释都懒得给。|贪图便利，单方面撕毁温存条款，驳回临时撤销申请。|今晚把欠下的温存补齐，坐回我身边，不准再借口逃开。|池太太欠下的账，我记得比谁都清楚。]`;

    const WV_P_NAP = String.raw`【私人百货生成指令】
请以「池衿宴（Mr. Chi）」的 EIP 私人黑卡账户视角，结合当前剧情与两人日常/私密生活，为「私人购物袋」甄选 2 到 3 件单品(包括绛绛的/池衿宴的或者家庭日用品)，并生成 1 条「私密采购档案」历史订单。内容偏好：有趣吸引绛绛，既有顶奢高定的宠溺，又有夫妻主卧私密情趣与生活张力。

【采购题材变化规则】
每次采购都要结合当前剧情选择不同的采购主题，不要默认围绕暖炉、羊绒毯、香氛、寝具或主卧用品展开。商品类别应主动轮换，可涉及成衣鞋履、包袋珠宝、腕表配饰、艺术收藏、旅行用品、办公用品、餐饮器具、家居设计、科技数码、日常补给及私密用品等；同一订单内的商品应有合理关联，但不必每次都属于卧室场景。订单名称、商品组合、备注和配送情境也要随主题变化，避免只替换品牌、金额或商品名称而重复同一套采购故事。不得为了多样性硬塞与当前剧情无关的商品。

<一、购物袋单品 · 字段描写要求（生成 2~3 条）>
1. 品牌名称：顶奢成衣、高定珠宝、香氛或私密护理品牌（根据内容自由发挥）。
2. 单品名称：具体单品名（可包含高定睡裙、礼服、包袋、鞋履、珠宝、身体护理油，或 0.01 L号礼盒、真丝眼罩、定制软缎束带等卧室私密日用品，根据内容自由发挥）。
3. 单品价格：只写纯数字（严禁出现逗号或货币符号，以便系统自动计算总额），如 18600。
4. 尺码规格：简短注明尺码、型号或颜色（根据内容自由发挥）。
5. 购买数量：只写纯数字，如 1 或 2。
6. 专属备注：池先生的买手指令或挑选时的私密考量与恶趣味（根据内容自由发挥）。

<二、采购档案订单 · 字段描写要求（生成 1 条）>
1. 订单编号：格式如 NP-0119-VIP。
2. 配送状态：简短状态（如“同城隐私专车闪送中”、“日内瓦专机空运中”等）。
3. 订单名称：该批采购的组合名称（自由发挥）。
4. 订单总额：只写纯数字，如 89000。
5. 订单详情：简述内含物品与特殊配送要求（自由发挥）。
6. 归档记录：签收人与归档位置说明（必须使用 Mr. Chi 或池先生称呼）。

<严格输出格式与正确示例（包含方括号与竖线，不得遗漏）>
[百货购物袋|此处填品牌名称|此处填单品名称|此处填纯数字单价|此处填尺码规格|此处填纯数字数量|此处填专属备注]
[百货订单|此处填订单编号|此处填配送状态|此处填订单名称|此处填纯数字总额|此处填订单详情|此处填归档记录]

格式示例(禁止照抄)：
[百货购物袋|SAGAMI ATELIER|0.01 L号超薄定制礼盒(30只装)|3200|L · 极薄定制|2|池先生专属指令：全私密无标封箱，免除管家拆检，直接放进主卧床头暗格]
[百货订单|NP-0209-EIP|同城隐私专车闪送中|主卧夜间安抚与寝具升级专送单|96000|含格拉斯助眠香氛、发热按摩油与高支真丝床品，池先生叮嘱今晚九点前必须送达|签收记录：已由 Mr. Chi 本人核验 · 归入主卧私人百货档案]`;

    const WV_P_BROWSER = String.raw`【私人浏览器生成指令】
请以「池衿宴（Mr. Chi）」的私人浏览器视角，结合当前剧情、夫妻日常与他的隐秘心理，生成 1 条「实时商业/生活简报」、5 条「日常常规搜索记录」，以及 3 条他在深夜开启“退出即焚”模式偷偷检索的「无痕搜索记录」。
内容偏好：有趣吸引绛绛，真实有生活感。特别注意：所有搜索记录必须严格保持“用户在搜索框输入的疑问词条 + 搜索引擎返回的客观专业解答摘要”的浏览器形态，严禁写成日记、备忘录或第一人称独白！

<一、实时简报（生成 1 条）>
1. 简报标题：简短财经或私人管家提醒（15字以内）。
2. 简报摘要：简述欧洲/亚太乳业动态、离岸信托收益归档，或与池太太相关的行程气候提醒。

<二、日常常规搜索（生成 5 条）>
1. 日常搜索词：公开模式检索词（可包含跨国并购、汇率，也可包含为绛绛搜索的食谱、肠胃调理、鲜花培育、礼物航线等日常词条）。
2. 检索来源描述：简短注明匹配网站类型。
3. 检索时间：简短时间。

<三、深夜无痕检索（生成 3 条）>
1. 检索分类：4个字定性（如“痕迹检索”、“阈值检索”、“事后护理”、“感官控制”等）。
2. 检索时间：英文或数字深夜时间（如“TODAY · 03:15”）。
3. 无痕搜索词：池衿宴背着绛绛偷偷在搜索框输入的私密问题（围绕占有欲、耐受度、吻痕咬痕消退、道具安全、事后安抚等，必须是搜索提问句式）。
4. 引擎检索摘要：搜索引擎/生理医学库/百科针对该词返回的客观专业解答预览（50字以上）。
5. 匹配结果数：只写纯数字（如 9、14）。

<严格输出格式与正确示例（包含方括号与竖线，不得遗漏）>
[简报|此处填简报标题|此处填简报摘要]
[日常搜索|此处填日常搜索词|此处填检索来源描述|此处填检索时间]
[无痕搜索|此处填4字分类|此处填检索时间|此处填无痕搜索词|此处填搜索引擎客观解答摘要|此处填纯数字匹配数]

格式示例(禁止照抄)：
[简报|欧洲原奶期货交割与私人行程提醒|苏黎世分部已完成季度结算，池太太名下离岸信托分红已自动入账；明日降温，主卧地暖已提前调高两度。]
[日常搜索|慢性浅表性胃炎伴糜烂及息肉钳除后一周温和流食食谱|临床营养学百科 · 术后饮食护理检索|12:30]
[无痕搜索|痕迹检索|TODAY · 03:42|锁骨下方与大腿内侧深层咬痕及吮吻红印加速消退方法|皮肤科与生理护理检索结果：角质层较薄区域的皮下毛细血管微渗血通常需 4 至 7 日自然吸收。若需避开日常领口视线，建议事后冷敷，或将重度留痕区域控制在贴身衣物完全覆盖的腿根内侧与腰窝处……|14]`;

    // 🧩 织章解析规则：第 1 组 = 标签名，第 2 组 = 竖线字段（兼容 | ｜ 和 【】）
    const WV_DEFAULT_RULES = [
        { name: "小红书解析规则", app: "小红书", color: "g-rose", enabled: true, find: String.raw`[\[【](小红书)\s*[|｜]([^\]】]*)[\]】]`, replace: "标题 | 正文 | #标签 | 点赞数" },
        { name: "浏览器解析规则", app: "浏览器", color: "g-purple", enabled: true, find: String.raw`[\[【](简报|日常搜索|无痕搜索)\s*[|｜]([^\]】]*)[\]】]`, replace: "简报 2 栏 · 日常 3 栏 · 无痕 5 栏" },
        { name: "记仇本契约规则", app: "记仇本", color: "g-lilac", enabled: true, find: String.raw`[\[【](记仇)\s*[|｜]([^\]】]*)[\]】]`, replace: "标题 | 类型 | 等级 | 控诉台词 | 违约经过 | 仲裁 | 索偿 | 私语" },
        { name: "钱包流水明细规则", app: "钱包", color: "g-gold", enabled: true, find: String.raw`[\[【](账单)\s*[|｜]([^\]】]*)[\]】]`, replace: "名称 | ±金额 | 时间备注" },
        { name: "NET-A-PORTER 规则", app: "NET-A-PORTER", color: "g-silver", enabled: true, find: String.raw`[\[【](百货购物袋|百货订单)\s*[|｜]([^\]】]*)[\]】]`, replace: "购物袋 6 栏 · 订单 6 栏" }
    ];
    
    const DEFAULT_WEAVE_TEMPLATES = [
        { name: "小红书", desc: "池衿宴笔记 · 封面 / 标题 / 正文 / 标签", icon: "xhs", color: "g-rose", enabled: true, content: WV_P_XHS.trim() },
        { name: "浏览器", desc: "简报 · 商务检索 · 深夜无痕", icon: "browser", color: "g-purple", enabled: true, content: WV_P_BROWSER.trim() },
        { name: "记仇本", desc: "违约案卷 · 控诉 / 经过 / 仲裁 / 索偿", icon: "grudge", color: "g-lilac", enabled: true, content: WV_P_GRUDGE.trim() },
        { name: "钱包", desc: "离岸流水 · 支出 / 收入明细", icon: "wallet", color: "g-gold", enabled: true, content: WV_P_WALLET.trim() },
        { name: "NET-A-PORTER", desc: "顶奢百货 · 卧室私密与高定", icon: "nap", color: "g-silver", enabled: true, content: WV_P_NAP.trim() },
        { name: "暗光岛论坛", desc: "加密匿名版 · 舆论与热议", icon: "forum", color: "g-purple", enabled: false, content: "【暗光岛生成指令】\n请生成暗光岛匿名板块讨论。\n输出格式：[论坛|板块|帖子标题|主楼正文|热评]" }
    ];

    extension_settings[extName].weaveData = Object.assign({
        currentTab: "templates",
        expandedApps: {},
        templates: JSON.parse(JSON.stringify(DEFAULT_WEAVE_TEMPLATES)),
          rules: JSON.parse(JSON.stringify(WV_DEFAULT_RULES)),
        lastRawCache: ""
    }, extension_settings[extName].weaveData || {});

    // 自动补齐旧存档里的颜色与图标字段
    extension_settings[extName].weaveData.templates.forEach((t, i) => {
        if (DEFAULT_WEAVE_TEMPLATES[i]) {
            t.color = DEFAULT_WEAVE_TEMPLATES[i].color;
            t.icon = DEFAULT_WEAVE_TEMPLATES[i].icon;
            t.name = DEFAULT_WEAVE_TEMPLATES[i].name;
        }
    });

    // 记仇本字段结构迁移：仅将仍使用旧七字段格式的已保存模板更新为新版八字段指令
    const savedGrudgeTemplate = extension_settings[extName].weaveData.templates.find(t => t.name === "记仇本");
    if (savedGrudgeTemplate && (
        savedGrudgeTemplate.content.includes("4. 契约事由：") ||
        savedGrudgeTemplate.content.includes("此处填契约事由|此处填私人仲裁")
    ) && !savedGrudgeTemplate.content.includes("契约事由·控诉")) {
        savedGrudgeTemplate.content = DEFAULT_WEAVE_TEMPLATES.find(t => t.name === "记仇本").content;
        saveSettingsDebounced();
    }

    // 生成指令优化迁移：仅向旧模板补入新规则，保留用户对原模板的其他自定义内容
    const weaveTemplates = extension_settings[extName].weaveData.templates;
    const xhsTemplate = weaveTemplates.find(t => t.name === "小红书");
    const xhsDiversityRule = "【题材变化规则】\\n每次生成都要根据当前剧情寻找不同的记录切口，不要把“赖床、拥抱、主卧、暖炉、睡衣、床头”等当作默认题材。可在商业日常、工作间隙、收藏与艺术、出行见闻、餐饮与生活、礼物、夫妻互动、居家琐事等方向中灵活选择；连续生成时主动更换叙事场景、事件类型和表达方式，避免只替换标题或物品名称、实质内容却高度相似。不要为了凑题材而编造当前剧情中不存在的重大事件。\\n\\n";
    if (xhsTemplate && !xhsTemplate.content.includes("【题材变化规则】")) {
        xhsTemplate.content = xhsTemplate.content.replace("<字段描写要求", xhsDiversityRule + "<字段描写要求");
        saveSettingsDebounced();
    }
    const napTemplate = weaveTemplates.find(t => t.name === "NET-A-PORTER");
    const napDiversityRule = "【采购题材变化规则】\\n每次采购都要结合当前剧情选择不同的采购主题，不要默认围绕暖炉、羊绒毯、香氛、寝具或主卧用品展开。商品类别应主动轮换，可涉及成衣鞋履、包袋珠宝、腕表配饰、艺术收藏、旅行用品、办公用品、餐饮器具、家居设计、科技数码、日常补给及私密用品等；同一订单内的商品应有合理关联，但不必每次都属于卧室场景。订单名称、商品组合、备注和配送情境也要随主题变化，避免只替换品牌、金额或商品名称而重复同一套采购故事。不得为了多样性硬塞与当前剧情无关的商品。\\n\\n";
    if (napTemplate && !napTemplate.content.includes("【采购题材变化规则】")) {
        napTemplate.content = napTemplate.content.replace("<一、购物袋单品", napDiversityRule + "<一、购物袋单品");
        saveSettingsDebounced();
    }
    const grudgeTemplate = weaveTemplates.find(t => t.name === "记仇本");
    if (grudgeTemplate && grudgeTemplate.content.includes("4. 契约事由·控诉：由池衿宴本人亲口对绛绛说出的控诉台词") && !grudgeTemplate.content.includes("严格限制在15个汉字以内")) {
        grudgeTemplate.content = grudgeTemplate.content.replace("不得写成旁白、心理描写或客观事件总结。", "**严格限制在15个汉字以内（标点不计），必须短促、有针对性；不得通过逗号或分句变相延长。**不得写成旁白、心理描写或客观事件总结。");
        saveSettingsDebounced();
    }

    extension_settings[extName].weaveData.rules.forEach((r, i) => {
        const colors = ["g-rose", "g-purple", "g-lilac", "g-gold", "g-silver"];
        r.color = r.color || colors[i % colors.length];
    });
    
    
   // =========================================================================
    // 📜【App 模块：织章 · Weave (2A/3)】读取真数据与前 4 栏渲染
    // =========================================================================
    function getLiveArchiveApps() {
        const s = extension_settings[extName];
        const bSec = (s.browserData?.secret || []).map((x, i) => ({ id: i, type: "sec", title: x.query, sub: `无痕 · ${x.date || "刚刚"}` }));
        const bNor = (s.browserData?.normal || []).map((x, i) => ({ id: i, type: "nor", title: x.title, sub: `日常 · ${x.date || "刚刚"}` }));
        return [
            { key: "xhs", name: "小红书", icon: "xhs", color: "g-rose", records: (s.xhsNotes || []).map((x, i) => ({ id: i, title: x.title, sub: `${x.isPinned ? "📌置顶 · " : ""}${x.likes || "1.2w"} 赞` })) },
            { key: "browser", name: "浏览器", icon: "browser", color: "g-purple", records: bSec.concat(bNor) },
            { key: "grudge", name: "记仇本", icon: "grudge", color: "g-lilac", records: (s.grudgeData?.records || []).map((x, i) => ({ id: i, title: x.title, sub: `${x.settled ? "已结清" : "待肉偿"} · ${x.date || "刚刚"}` })) },
            { key: "wallet", name: "钱包", icon: "wallet", color: "g-gold", records: (s.walletData?.bills || []).map((x, i) => ({ id: i, title: x.title, sub: `${Number(x.amount) >= 0 ? "+" : "-"} ¥ ${Math.abs(Number(x.amount) || 0).toLocaleString()}` })) },
            { key: "nap", name: "NET-A-PORTER", icon: "nap", color: "g-silver", records: (s.napData?.bag || []).map((x, i) => ({ id: i, title: x.name, sub: `${x.brand || "高定"} · ¥ ${Number(x.price || 0).toLocaleString()}` })) }
        ];
    }

    let wvEditMode = "tpl", wvEditIdx = 0;

    function renderWeaveApp() {
        const wd = extension_settings[extName].weaveData;
        const tab = wd.currentTab || "templates";
        $("#wv_nav button").removeClass("active").filter(`[data-wvtab="${tab}"]`).addClass("active");
        let html = "";

        if (tab === "rules") {
            html = `<div class="wv-eyebrow">REGEX ARCHIVE / 01</div><div class="wv-h2">规则库</div><div class="wv-sub">用于从 AI 回执文本中精准提取字段并分发入库。</div><div class="wv-sectionhead"><strong>正则表达式</strong><span class="wv-count">${wd.rules.length} RULES</span></div>` +
                wd.rules.map((r, i) => `<div class="wv-item"><div class="wv-glyph ${r.color || "g-purple"}">${WV_ICONS.regex}</div><div class="wv-itemtext"><strong>${r.name}</strong><small>${r.app} · ${r.enabled ? "已激活" : "已暂挂"}</small></div><button class="wv-action" data-wvedit="rule" data-idx="${i}">EDIT →</button></div>`).join("");
        } else if (tab === "templates") {
            html = `<div class="wv-eyebrow">SCHEMAS & PRESETS / 02</div><div class="wv-h2">格式集</div><div class="wv-sub">每个软件的输出规范。点 EDIT 进入可随时切换内置或自定存档。</div><div class="wv-sectionhead"><strong>输出规范模板</strong><span class="wv-count">${wd.templates.length} SCHEMAS</span></div>` +
                wd.templates.map((t, i) => `<div class="wv-item"><div class="wv-glyph ${t.color || "g-purple"}">${WV_ICONS[t.icon] || WV_ICONS.regex}</div><div class="wv-itemtext"><strong>${t.name}</strong><small>${t.desc}</small></div><button class="wv-action" data-wvedit="tpl" data-idx="${i}">EDIT →</button></div>`).join("");
        } else if (tab === "batch") {
            html = `<div class="wv-eyebrow">DARKLIGHT SYNTHESIS / 03</div><div class="wv-h2">暗光织章</div><div class="wv-sub">勾选本次需要联动的篇章，一键生成并自动分发各端。</div><div class="wv-sectionhead"><strong>待生成篇章</strong><span class="wv-count">${wd.templates.filter(t => t.enabled).length} SELECTED</span></div><div class="wv-checks">` +
                wd.templates.map((t, i) => `<label class="wv-check ${t.enabled ? "selected" : ""}"><input type="checkbox" data-wvtchk="${i}" ${t.enabled ? "checked" : ""}><span>${t.name}</span></label>`).join("") +
                `</div><div class="wv-divider"></div><div class="wv-panel"><div class="wv-paneltitle">联动机关 <span class="wv-tag">ORCHESTRATION</span></div><div class="wv-toggleline">按模板顺序一次性拼接指令 <button class="wv-switch on" data-wvsw></button></div><div class="wv-toggleline">生成后自动执行正则入库 <button class="wv-switch on" data-wvsw></button></div></div><button class="wv-primary" id="wv_batch_btn">WEAVE STORIES · 一键织章生成 →</button><div class="wv-cache-box"><div class="wv-sectionhead"><strong>RAW CACHE · 历史回执缓存</strong><span class="wv-count">SAVED</span></div><div class="wv-cache-card"><div class="wv-cache-meta"><span>SAVED LOCALLY · 永久缓存</span><span style="color:var(--berry);">免消耗 Token</span></div><div class="wv-cache-preview">${wd.lastRawCache || "暂无缓存"}</div><div class="wv-cache-actions">
    <button class="wv-btn-cache-edit" id="wv_btn_cache_edit">编辑回执</button>
    <button class="wv-btn-cache-copy" id="wv_btn_cache_copy">一键复制</button>
    <button class="wv-btn-reparse" id="wv_btn_reparse">⚡ 重新解析并分发</button>
</div></div></div>`;
        } else if (tab === "single") {
            html = `<div class="wv-eyebrow">SOLITARY CHAPTER / 04</div><div class="wv-h2">独章生成</div><div class="wv-sub">针对单一软件生成独立内容，支持追加实时微调剧情。</div><div class="wv-sectionhead"><strong>生成目标</strong><span class="wv-count">TARGET</span></div><div class="wv-field"><select id="wv_single_sel">` +
                wd.templates.map((t, i) => `<option value="${i}">${t.name}</option>`).join("") +
                `</select></div><div class="wv-field"><label>本次微调指引（可选 · 如：今天他特别吃醋）</label><textarea id="wv_single_prompt" placeholder="可在此输入当前章节的突发小细节……"></textarea></div><button class="wv-primary" id="wv_single_btn">GENERATE CHAPTER · 单章生成 →</button>`;
        }
       // =====================================================================
        // 📜【App 模块：织章 · Weave (2B/3)】第 5 栏卷宗渲染与风琴单删事件
        // =====================================================================
        else if (tab === "archive") {
            const apps = getLiveArchiveApps();
            html = `<div class="wv-eyebrow">DATA ARCHIVE / 05</div><div class="wv-h2">卷宗中枢</div><div class="wv-sub">默认显示各软件最新动态。轻触卡片展开历史案卷，支持单条精准清理。</div><div class="wv-sectionhead"><strong>全部软件卷宗记录</strong><span class="wv-count">ACCORDION</span></div>` +
                apps.map(app => {
                    const exp = wd.expandedApps?.[app.key] ? "expanded" : "";
                    const cnt = app.records.length;
                    const latest = cnt > 0 ? `${app.records[0].title} · ${app.records[0].sub}` : "暂无生成记录";
                    const rows = cnt > 0 ? app.records.map(r => `<div class="wv-archive-row"><div style="flex:1;min-width:0;"><div class="wv-archive-title">${r.title || "记录"}</div><div class="wv-archive-sub">${r.sub || ""}</div></div><button class="wv-btn-del-single" data-wvdel="${app.key}" data-rid="${r.id}" data-rtype="${r.type || ""}">${WV_ICONS.trash}</button></div>`).join("") : `<div style="font-size:10px;color:#aaa;text-align:center;padding:6px 0;">该软件目前没有生成记录</div>`;
                    return `<div class="wv-fold-card ${exp}"><div class="wv-fold-head" data-wvfold="${app.key}"><div class="wv-fold-left"><div class="wv-glyph ${app.color}">${WV_ICONS[app.icon]}</div><span class="wv-fold-name">${app.name}</span></div><div class="wv-fold-right"><span class="wv-fold-badge">${cnt} 条卷宗</span><svg class="wv-fold-arrow" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="6 9 12 15 18 9"/></svg></div></div><div class="wv-fold-preview">${latest}</div><div class="wv-fold-body">${rows}</div></div>`;
                }).join("") +
                `<div class="wv-doomsday-box"><div class="wv-cyber-alert-icon"><svg viewBox="0 0 24 24" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><circle cx="12" cy="17" r="0.8" fill="currentColor"/></svg></div><div class="wv-doomsday-title">全域出厂清零 · SYSTEM RESET</div><div class="wv-doomsday-desc">将小手机全部软件数据彻底清零重置（钱包本金回退 1.93 亿，小红书仅保留初始置顶，其余全部净空）。</div><button class="wv-btn-doomsday" id="wv_doomsday_btn"><svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 9v4M12 17h.01M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/></svg><span>确认执行全部软件清零 · 恢复出厂空白</span></button></div>`;
        }
        $("#wv_main").html(html);
    }

    $(document).on("click", '.jp-icon-btn[data-app="jp_p_weave"]', () => { switchPage("jp_p_weave"); renderWeaveApp(); });
    $(document).on("click", "#wv_home_back", () => switchPage("jp_p_home"));
    $(document).on("click", "#wv_nav button", function () { extension_settings[extName].weaveData.currentTab = $(this).data("wvtab"); saveSettingsDebounced(); renderWeaveApp(); });
    $(document).on("change", "#wv_main [data-wvtchk]", function () { const idx = Number($(this).data("wvtchk")); const wd = extension_settings[extName].weaveData; if (wd.templates[idx]) wd.templates[idx].enabled = $(this).prop("checked"); saveSettingsDebounced(); renderWeaveApp(); });
    $(document).on("click", "#wv_main [data-wvsw]", function () { $(this).toggleClass("on"); });
    $(document).on("click", "[data-wvfold]", function () { const k = $(this).data("wvfold"); const wd = extension_settings[extName].weaveData; wd.expandedApps = wd.expandedApps || {}; wd.expandedApps[k] = !wd.expandedApps[k]; renderWeaveApp(); });

    $(document).on("click", "[data-wvdel]", function (e) {
        e.stopPropagation();
        const k = $(this).data("wvdel"), id = Number($(this).data("rid")), rt = $(this).data("rtype"), s = extension_settings[extName];
        if (k === "xhs") { s.xhsNotes?.splice(id, 1); renderXhsNotes(); }
        else if (k === "browser") { if (rt === "sec") s.browserData?.secret?.splice(id, 1); else s.browserData?.normal?.splice(id, 1); renderBrowserApp(); }
        else if (k === "grudge") { s.grudgeData?.records?.splice(id, 1); renderGrudgeApp(); }
        else if (k === "wallet") { s.walletData?.bills?.splice(id, 1); renderWalletApp(); }
        else if (k === "nap") { s.napData?.bag?.splice(id, 1); renderNapApp(); }
        saveSettingsDebounced(); renderWeaveApp(); toastr.info("已移除该条记录");
    });
     // =========================================================================
    // 📜【App 模块：织章 · Weave (2C/3)】双预设编辑抽屉、核验注入与全域清零
    // =========================================================================
    $(document).on("click", "[data-wvedit]", function () {
        wvEditMode = $(this).data("wvedit"); wvEditIdx = Number($(this).data("idx"));
        const wd = extension_settings[extName].weaveData;
        if (wvEditMode === "tpl") {
            const cur = wd.templates[wvEditIdx];
            $("#wv_edit_title").text(`EDIT ${cur.name}`);
            $("#wv_edit_sync_tools").html(`<button class="wv-btn-pill" id="wv_load_def">还原内置</button><button class="wv-btn-pill" id="wv_load_cus">我的自定</button><button class="wv-save" id="wv_save_cfg">SAVE</button>`);
            $("#wv_edit_body").html(`<div class="wv-eyebrow">SCHEMA DEFINITION</div><div class="wv-h2" style="font-size:18px;">${cur.name}</div><div class="wv-divider"></div><div class="wv-field"><label>软件说明</label><input id="wv_in_desc" value="${cur.desc || ""}"></div><div class="wv-field"><label>输出格式指令 (右上角可随时切换内置/自定)</label><textarea id="wv_in_content">${cur.content || ""}</textarea></div>`);
        } else {
            const cur = wd.rules[wvEditIdx];
            $("#wv_edit_title").text("EDIT REGEX");
            $("#wv_edit_sync_tools").html(`<button class="wv-save" id="wv_save_cfg">SAVE</button>`);
            $("#wv_edit_body").html(`<div class="wv-eyebrow">REGEX LOGIC</div><div class="wv-h2" style="font-size:18px;">${cur.name}</div><div class="wv-divider"></div><div class="wv-field"><label>匹配正则 · REGEX FIND</label><textarea id="wv_in_find">${cur.find || ""}</textarea></div><div class="wv-field"><label>替换映射 · FIELD MAP</label><input id="wv_in_rep" value="${cur.replace || ""}"></div>`);
        }
        $("#wv_editor").addClass("show");
    });
    $(document).on("click", "#wv_edit_back", () => $("#wv_editor").removeClass("show"));
    $(document).on("click", "#wv_load_def", () => { if (DEFAULT_WEAVE_TEMPLATES[wvEditIdx]) { $("#wv_in_content").val(DEFAULT_WEAVE_TEMPLATES[wvEditIdx].content); toastr.info("已刷入出厂内置黄金规范"); } });
    $(document).on("click", "#wv_load_cus", () => { const cur = extension_settings[extName].weaveData.templates[wvEditIdx]; if (cur) { $("#wv_in_content").val(cur.content); toastr.info("已还原为你的私房自定存档"); } });
    $(document).on("click", "#wv_save_cfg", () => {
        const wd = extension_settings[extName].weaveData;
        if (wvEditMode === "tpl") { wd.templates[wvEditIdx].desc = $("#wv_in_desc").val().trim(); wd.templates[wvEditIdx].content = $("#wv_in_content").val(); }
        else { wd.rules[wvEditIdx].find = $("#wv_in_find").val(); wd.rules[wvEditIdx].replace = $("#wv_in_rep").val(); }
        saveSettingsDebounced(); $("#wv_editor").removeClass("show"); renderWeaveApp(); toastr.success("已永久保存配置 ✨");
    });

    

    window.resetAllPhoneData = function () {
        const s = extension_settings[extName];
        s.xhsNotes = [{ id: "note_init_1", title: "山顶雪夜私藏视角", content: "雪落在松针上的时候很安静。\n某些人不肯戴围巾，耳朵冻得通红，非要钻进我大衣里取暖。\n下山的时候睡得很沉。", tags: "#私人日常 #雪季 #独家记忆", likes: "52.1w", time: "昨天 22:40", isPinned: true, bg: "#F9ECEF" }];
        if (s.walletData) { s.walletData.balance = 193579800; s.walletData.lastIn = "+0.00"; s.walletData.lastOut = "-0.00"; s.walletData.bills = []; }
        if (s.grudgeData) { s.grudgeData.records = []; s.grudgeData.currentIdx = 0; }
        if (s.napData) { s.napData.bag = []; s.napData.orders = []; }
        if (s.browserData) { s.browserData.briefing = { title: "", desc: "" }; s.browserData.normal = []; s.browserData.secret = []; }
        renderXhsNotes?.(); renderWalletApp?.(); renderGrudgeApp?.(); renderNapApp?.(); renderBrowserApp?.();
        saveSettingsDebounced(); renderWeaveApp(); toastr.success("⚠️ 全部软件已执行出厂清零！恢复初始空白状态！");
    };
    $(document).on("click", "#wv_doomsday_btn", () => window.resetAllPhoneData());
            
       // =========================================================================
    // 📜【App 模块：织章 · Weave (3A/3)】正则扫描与各软件自动分发
    // =========================================================================
    function wvScan(text, appName) {
        const r = extension_settings[extName].weaveData.rules.find(x => x.app === appName);
        if (!r || !r.enabled) return [];
        const out = [];
        try {
            const re = new RegExp(r.find, "g");
            let m;
            while ((m = re.exec(text)) !== null) {
                if (!m[0]) { re.lastIndex++; continue; }
                out.push({ tag: m[1], f: String(m[2] || "").split(/[|｜]/).map(s => s.trim()) });
            }
        } catch (e) { toastr.error(`「${r.name}」正则写法有误，请去规则库检查`); }
        return out;
    }
    // 织章回执稳定识别键：同一条原始内容重复解析时命中同一记录
    function wvMakeKey(type, fields) {
        return type + ":" + JSON.stringify(fields.map(value => String(value ?? "").trim()));
    }
    const wvNum = v => Number(String(v || "").replace(/[−–—]/g, "-").replace(/[^\d.+-]/g, "")) || 0;

    window.jpWeaveDispatch = function (raw) {
        const text = String(raw || ""), res = [];
        const xhs = wvScan(text, "小红书");
        xhs.forEach(({ f }) => window.addXhsNoteFromAI?.({ title: f[0], content: (f[1] || "").replace(/\\n/g, "\n"), tags: f[2], likes: f[3] }));
        if (xhs.length) res.push(`小红书 +${xhs.length}`);

        const bills = wvScan(text, "钱包").map(({ f }) => ({ title: f[0], amount: wvNum(f[1]), sub: f[2] || "刚刚" }));
        if (bills.length) { window.updateWalletFromAI?.(bills); res.push(`钱包 +${bills.length}`); }

        const gds = wvScan(text, "记仇本");
        gds.forEach(({ f }) => {
            window.addGrudgeFromAI?.({
                title: f[0], type: f[1], level: f[2],
                complaint: f[3], body: f[4],
                judgment: f[5], remedy: f[6], quote: f[7]
            });
        });
        if (gds.length) res.push(`记仇本 +${gds.length}`);

        const nap = wvScan(text, "NET-A-PORTER");
        const bag = nap.filter(x => x.tag === "百货购物袋").map(({ f }) => ({ brand: f[0], name: f[1], price: wvNum(f[2]), size: f[3], qty: wvNum(f[4]) || 1, note: f[5] }));
        const orders = nap.filter(x => x.tag === "百货订单").map(({ f }) => ({ no: f[0], status: f[1], name: f[2], price: wvNum(f[3]), desc: f[4], archive: f[5] }));
        if (nap.length) { window.updateNapFromAI?.({ bag: bag.length ? bag : undefined, orders }); res.push(`百货 +${nap.length}`); }

        const br = wvScan(text, "浏览器");
        if (br.length) {
            const p = { briefing: null, normal: [], secret: [] };
            br.forEach(({ tag, f }) => {
                if (tag === "简报") p.briefing = { title: f[0], desc: f[1] || "" };
                else if (tag === "日常搜索") p.normal.push({ title: f[0], desc: f[1] || "", date: f[2] || "刚刚" });
                else p.secret.push({ type: f[0], date: f[1] || "JUST NOW", query: f[2], answer: f[3] || "", count: wvNum(f[4]) || 12 });
            });
            window.updateBrowserFromAI?.(p); res.push(`浏览器 +${br.length}`);
        }
        return res;
    };   
        // =========================================================================
    // 📜【App 模块：织章 · Weave (3B/3)】一键织章 · 单章生成 · 缓存重解析
    // =========================================================================
    const WV_HEAD = "【织章 · 多软件联动生成】请一次性完成下方全部任务。只输出各任务要求的方括号标签，每条标签独占一行；任何字段内禁止出现竖线 | 与方括号 [ ]，正文需要换行时用 \\n 表示；不要输出任何解释、前言、标题或代码块。";

    async function wvRunGenerate(prompt, $btn, label) {
        if ($btn.prop("disabled")) return;
        $btn.prop("disabled", true).text("织章中 · 正在等待回执……");
        try {
            const raw = String(await generatePhoneContent(`${WV_HEAD}\n\n${prompt}`) || "").trim();
            if (!raw) throw new Error("AI 返回为空");
            const wd = extension_settings[extName].weaveData;
            wd.lastRawCache = raw;
            saveSettingsDebounced();
            const sw = $("#wv_main [data-wvsw]").eq(1), auto = !sw.length || sw.hasClass("on");
            const res = auto ? window.jpWeaveDispatch(raw) : [];
            renderWeaveApp();
            if (!auto) toastr.info("回执已存入缓存，可稍后手动解析分发");
            else if (res.length) toastr.success(`织章完成 ✧ ${res.join(" · ")}`);
            else toastr.warning("回执已缓存，但没识别到标签，可检查格式后重新解析");
        } catch (e) {
            toastr.error(`织章失败：${e.message || e}`);
            $btn.prop("disabled", false).text(label);
        }
    }

    $(document).off("click.wvgen")
        .on("click.wvgen", "#wv_batch_btn", function () {
            const list = extension_settings[extName].weaveData.templates.filter(t => t.enabled && t.content);
            if (!list.length) return toastr.warning("请先勾选至少一个篇章");
            wvRunGenerate(list.map((t, i) => `——任务 ${i + 1}：${t.name}——\n${t.content}`).join("\n\n"), $(this), "WEAVE STORIES · 一键织章生成 →");
        })
        .on("click.wvgen", "#wv_single_btn", function () {
            const t = extension_settings[extName].weaveData.templates[Number($("#wv_single_sel").val())];
            if (!t) return;
            const extra = String($("#wv_single_prompt").val() || "").trim();
            wvRunGenerate(`${t.content}${extra ? `\n\n【本次剧情微调】${extra}` : ""}`, $(this), "GENERATE CHAPTER · 单章生成 →");
        })
                .on("click.wvgen", "#wv_btn_cache_edit", function () {
            const raw = extension_settings[extName].weaveData.lastRawCache || "";
            if (!raw) return toastr.info("暂无缓存回执");

            wvEditMode = "raw";
            $("#wv_edit_title").text("RAW RECEIPT · 原始回执编辑");

            $("#wv_edit_sync_tools").html(`
                <button class="wv-btn-cache-copy" id="wv_btn_cache_copy_editor">一键复制</button>
                <button class="wv-save" id="wv_btn_cache_save">保存回执</button>
            `);

            $("#wv_edit_body").html(`
                <div class="wv-eyebrow">LOCAL CACHE / NO TOKEN</div>
                <div class="wv-h2" style="font-size:18px;">编辑 AI 原始回执</div>
                <div class="wv-sub">
                    可以自由选中、复制或修改长文本。保存只更新本地缓存，不消耗 Token，也不会自动分发。
                </div>
                <div class="wv-field wv-raw-field">
                    <label>RAW RESPONSE · ${raw.length.toLocaleString()} CHARACTERS</label>
                    <textarea id="wv_raw_cache_editor" class="wv-raw-cache-editor" spellcheck="false"></textarea>
                </div>
                <div class="wv-raw-footnote">
                    修改完成后点击右上角「保存回执」。如需写入各 App，请返回后再点「重新解析并分发」。
                </div>
            `);

            $("#wv_raw_cache_editor").val(raw);
            $("#wv_editor").addClass("show");
            setTimeout(() => $("#wv_raw_cache_editor").trigger("focus"), 80);
        })

        .on("click.wvgen", "#wv_btn_cache_copy, #wv_btn_cache_copy_editor", async function () {
            const text = $(this).attr("id") === "wv_btn_cache_copy_editor"
                ? String($("#wv_raw_cache_editor").val() || "")
                : String(extension_settings[extName].weaveData.lastRawCache || "");

            if (!text) return toastr.info("暂无可复制的回执");

            try {
                if (navigator.clipboard && window.isSecureContext) {
                    await navigator.clipboard.writeText(text);
                } else {
                    const ta = document.createElement("textarea");
                    ta.value = text;
                    ta.setAttribute("readonly", "");
                    ta.style.position = "fixed";
                    ta.style.opacity = "0";
                    ta.style.left = "-9999px";
                    document.body.appendChild(ta);
                    ta.select();

                    const ok = document.execCommand("copy");
                    ta.remove();

                    if (!ok) throw new Error("浏览器未允许复制");
                }

                toastr.success("原始回执已复制");
            } catch (e) {
                toastr.error("复制失败，请在编辑页长按文本手动选择复制");
            }
        })

        .on("click.wvgen", "#wv_btn_cache_save", function () {
            const editor = document.getElementById("wv_raw_cache_editor");
            if (!editor) return;

            const wd = extension_settings[extName].weaveData;
            wd.lastRawCache = editor.value;

            saveSettingsDebounced();

            $("#wv_editor").removeClass("show");
            renderWeaveApp();

            toastr.success("回执已保存到本地缓存（尚未分发）");
        })
        .on("click.wvgen", "#wv_btn_reparse", function () {
            const raw = extension_settings[extName].weaveData.lastRawCache;
            if (!raw) return toastr.info("暂无缓存回执");
            const res = window.jpWeaveDispatch(raw);
            renderWeaveApp();
            res.length ? toastr.success(`已重新分发 ✧ ${res.join(" · ")}`) : toastr.warning("缓存里没识别到可用标签");
        });
                    
                         
                                
                                       
                                                     
            
               // =========================================================================
    // 🔄【桌面全屏版专属神器】长按右下角蝴蝶结小手机图标 0.5 秒 -> 直接刷新酒馆！
    // =========================================================================
    let jpRefreshTimer = null;
    $(document).on("touchstart mousedown", "#lime_phone_entry_btn", () => {
        jpRefreshTimer = setTimeout(() => {
            toastr.info("正在为你刷新酒馆... 🔄");
            setTimeout(() => window.location.reload(), 150);
        }, 500);
    }).on("touchend mouseup touchmove", "#lime_phone_entry_btn", () => {
        clearTimeout(jpRefreshTimer);
    });
      