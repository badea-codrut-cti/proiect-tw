window.addEventListener("load", () => {
    let cols = [...document.getElementById("tabel-produse").
    children[0].children[0].children].map(child => child.innerText).filter(key => key != "Actiuni");

    [...document.querySelectorAll('.btn-salvare')].forEach(el => {
        el.onclick = () => {
            let row = el.parentElement.parentElement;
            let fObj = {};
            [...row.children].filter(child => child.querySelector("textarea")).forEach((child, i) => {
                let tArea = child.querySelector("textarea");
                fObj[cols[i]] = tArea.value;
            });

            console.log(fObj);

            fetch("/admin_produse", {
                method: "POST",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(fObj)
            })
        }
    });

    [...document.querySelectorAll('.btn-stergere')].forEach(el => {
        let id = el.parentElement.parentElement.children[0].querySelector("textarea").value;
        el.onclick = () => {
            fetch("/admin_produse", {
                method: "DELETE",
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({id})
            })
        }
    });
});