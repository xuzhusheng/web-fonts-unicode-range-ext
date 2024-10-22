const getTextNodes = () => {
    const walker = document.createTreeWalker(
        document.body,
        NodeFilter.SHOW_TEXT
    );
    let node;
    const textNodes = [];

    while ((node = walker.nextNode())) {
        const style = getComputedStyle(node.parentElement);
        textNodes.push([style.fontFamily, style.fontStyle, node.nodeValue]);
    }
    return textNodes;
};

const unicode = (characters) => {
    const groups = characters
        .map((c) => c.charCodeAt())
        .reduce((groups, code, index) => {
            const key = code - index;
            if (!groups[key]) groups[key] = [];

            groups[key].push(code.toString(16));
            return groups;
        }, {});

    return Object.keys(groups)
        .map((key) => {
            const values = groups[key];
            if (values.length == 1) {
                return `U+${values[0]}`.toUpperCase();
            }
            return `U+${values[0]}-${values.pop()}`.toUpperCase();
        })
        .join(",");
};

const parse = (textNodes) => {
    if (!textNodes) return null;

    const getName = (name) => name.split(",")[0].replaceAll('"', "");
    const getKey = (item) => `${getName(item[0])}-${item[1]}`;

    const groups = textNodes.reduce((groups, current) => {
        const key = getKey(current);
        if (!groups[key]) groups[key] = [];

        groups[key].push(current);
        return groups;
    }, {});

    return Object.keys(groups).map((key) => {
        const [name, style] = key.split("-");
        const characters = Array.from(
            new Set(groups[key].map((item) => item[2]).join(""))
        ).sort();
        return {
            "font-family": name,
            "font-style": style,
            characters: characters.join(""),
            "unicode-range": unicode(characters),
        };
    });
};

chrome.sidePanel
    .setPanelBehavior({ openPanelOnActionClick: false })
    .catch((error) => console.error(error));

chrome.action.onClicked.addListener((tab) => {
    if (tab.url?.startsWith("chrome://")) return;
    chrome.sidePanel.open({ tabId: tab.id });
    chrome.scripting.executeScript({
        target: { tabId: tab.id },
        files: ["content.js"],
    });
});

chrome.tabs.onActivated.addListener(async (activeInfo) => {
    const tab = await chrome.tabs.get(activeInfo.tabId);

    if(!tab.url) return
    if (tab.url?.startsWith("chrome://")) return;

    chrome.scripting.executeScript({
        target: { tabId: activeInfo.tabId },
        files: ["content.js"],
        // func: getTextNodes
    });
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    chrome.storage.session.set({
        unicode: JSON.stringify(parse(message.textNodes), null, 2),
    });
});
