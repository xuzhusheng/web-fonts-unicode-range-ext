const update = (data) =>
    (document.getElementById("unicode").textContent = data);

chrome.storage.session.get("unicode").then((data) => {
    update(data.unicode);
});

chrome.storage.session.onChanged.addListener((changes) => {
    update(changes.unicode.newValue);
});
