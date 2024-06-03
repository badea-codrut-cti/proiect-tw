window.addEventListener("load", () => {
    [...document.querySelectorAll("button[id^='del-usr-']")].forEach(el => {
        el.onclick = async () => {
            let uid = el.id.substring(8);
            let resp = await fetch(`/api/sterge_user/${uid}`);
        }
    });
    [...document.querySelectorAll("button[id^='del-pfp-']")].forEach(el => {
        el.onclick = async () => {
            let uid = el.id.substring(8);
            let resp = await fetch(`/api/sterge_poza/${uid}`);
        }
    });
});