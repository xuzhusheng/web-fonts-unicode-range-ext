// document.fonts.ready.then(() => {
//     console.log("fonts ready")
//     setTimeout(() => {
//         const walker = document.createTreeWalker(
//             document.body,
//             NodeFilter.SHOW_TEXT
//         );
//         let node;
//         const textNodes = [];

//         while ((node = walker.nextNode())) {
//             const style = getComputedStyle(node.parentElement);
//             textNodes.push([style.fontFamily, style.fontStyle, node.nodeValue]);
//         }
//         chrome.runtime.sendMessage({ textNodes: textNodes });
//     }, 200);
// });
(() => {
    const resizeObserver = new ResizeObserver((entries, observer) => {
        if (!chrome.runtime.id) {
            observer.unobserve(document.body);
            return;
        }
        
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
        chrome.runtime.sendMessage({ textNodes: textNodes });
    });
    resizeObserver.observe(document.body);
})();
