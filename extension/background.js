console.log("🔥 Background Script....");

const AddNewData = (key,data) => {
    chrome.storage.local.get([key], (result) => {
        prevdata = Boolean(Object.keys(result).length) ? result[key] : []
        let newData = prevdata.concat(data);
        chrome.storage.local.set({ [key]: newData }, () => {
            chrome.storage.local.get([key], (result) => {
                // console.log(result[key]);
                chrome.action.setBadgeText({ text: JSON.stringify(result[key].length) })
            })
        })
    })
}
const GetData = () => {
    return new Promise((resolve, reject) => {
        let key = "ScrapedData"
            chrome.storage.local.get([key], (result) => {
                let data = Boolean(Object.keys(result).length) ? result[key] : []
                chrome.action.setBadgeText({ text: JSON.stringify(data.length) })
                resolve(data)
            })
    })
}

// -----------------------Initial Function Calls Start----------------------

GetData()

// -----------------------Initial Function Calls End----------------------

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log(message);
    if (message.type === "Add") {
        AddNewData("ScrapedData",message.data)
        sendResponse("✅")
    } else if (message.type == "StartScraping" || message.type == "StopScraping") {
        sendResponse("✅")
        chrome.tabs.query({}, (tabs) => {
            tabs.forEach((tab) => {
                if (tab.url.includes("https://www.freelancer.com/search/projects")) {
                    console.log("Tab Id", tab.id);
                    chrome.tabs.sendMessage(tab.id, message, (response) => {
                        sendResponse(response)
                    })
                }
            });
        });
    }else if(message.type==="logMsg"){
        let currentDate = new Date();
        AddNewData("Log",[{at:currentDate.toLocaleString(),
            msg:message.data,
            type:message.logType}])
        sendResponse("✅")
    }
})