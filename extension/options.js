console.log("🔥 Options Script.....");

const AddNewData = (data) => {
    let key = "ScrapedData"

    if (typeof data === "object") {
        data = [data]
    }

    chrome.storage.local.get([key], (result) => {
        console.log(Object.keys(result).length);
        prevdata = Boolean(Object.keys(result).length) ? result[key] : []
        let newData = Boolean(prevdata.length) ? [...prevdata, ...data] : data;

        chrome.storage.local.set({ [key]: newData }, () => {
            chrome.storage.local.get([key], (result) => {
                console.log(result[key]);
            })
        })
    })
}


const ClearStorage=()=>{
    chrome.storage.local.clear(()=>{
        console.log("Storage Cleared");
      });
}

const addData = (e) => {
    e.preventDefault()
    let data = new FormData(e.target)
    data = Object.fromEntries(data.entries())
    console.log(data);
    AddNewData(data)
    // ClearStorage()
}

window.onload = () => {
    document.querySelector("form").addEventListener("submit", addData);
}
