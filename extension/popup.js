import { AddNewData, GetData } from "./utils.js"
console.log("🔥 Popup Script .....");

// ----------------------- Functions Section Start ----------------------

const Msg = (at, msg, type) => {
    /**
     * Generates a formatted message with the provided content and type.
     * Appends the message to the Terminal and Scrolls to the bottom of the Terminal.
     * @param {string} msg - The message content to be displayed.
     * @param {string} type - The type of message [danger,warning].
     * @returns {void}
     */
    let currentDate = new Date();
    const newMsg = document.createElement("p");
    newMsg.classList.add("msg", type);
    newMsg.innerHTML = `
        <span class="loggedAt">${at ? at : currentDate.toLocaleString()}</span> 
        <span class="seperator">-></span>
        ${msg}
    `;

    const divElement = document.getElementById("terminal"); // Replace "yourDivId" with the actual ID of your <div> element
    divElement.appendChild(newMsg);
    divElement.scrollTop = divElement.scrollHeight;
}


// ----------------------- Functions Section End ----------------------

let ScraperStatus;
GetData("ScraperStatus").then(data => {
    console.log("GetData('ok') Response:", data)
    if (data === null) {
        ScraperStatus = AddNewData("ScraperStatus", false)

    } else {
        ScraperStatus = data
    }

    if (ScraperStatus) {
        document.getElementById("Scrape_btn").innerText = "⏸ Stop Scraping"
    } else {
        document.getElementById("Scrape_btn").innerText = "🎣 Start Scraping"
    }
});
const PlayPauseScraper = () => {
    ScraperStatus = !ScraperStatus
    if (ScraperStatus) {
        chrome.runtime.sendMessage({ type: "StartScraping" },
            (response) => {
                console.log("StartScraping ", response);
                AddNewData("ScraperStatus", true)
                document.getElementById("Scrape_btn").innerText = "⏸ Stop Scraping"
            })
    } else {
        chrome.runtime.sendMessage({ type: "StopScraping" },
            (response) => {
                console.log("StopScraping ", response);
                AddNewData("ScraperStatus", false)
                document.getElementById("Scrape_btn").innerText = "🎣 Start Scraping"
            })
    }
}
const DownloadScrapedData = (FinalData, filename) => {
    console.log(`⏬ Downloading ${FinalData.length}  Records`);
    const jsonData = JSON.stringify(FinalData, null, 2); // Convert array to JSON string with indentation

    const blob = new Blob([jsonData], {
        type: "application/json",
    }); // Create a Blob object
    const url = URL.createObjectURL(blob); // Create a URL for the Blob

    const link = document.createElement("a"); // Create a download link
    link.href = url;
    link.download = filename; // Set the filename for the downloaded file
    link.click(); // Trigger the download

    // Clean up the URL object after the download
    setTimeout(() => {
        URL.revokeObjectURL(url);
    }, 0);
};
// ----------------------- Operations Section Start------------------------

window.onload = () => {



    const Scrape_btn = document.getElementById("Scrape_btn")
    const CleanStorage_btn = document.getElementById("CleanStorage_btn")

    CleanStorage_btn.addEventListener("click", () => {
        chrome.storage.local.clear(() => {
            console.log("Storage Formated");
            GetData("ScrapedData").then((data) => {
                if (data === null) {
                    chrome.action.setBadgeText({ text: "0" })
                }
            }
            )
        });
    })

    document.getElementById("Download_btn").addEventListener("click", () => {
        GetData("ScrapedData").then((data) => {
            if (data !== null) {
                DownloadScrapedData(data, "ScrapedData.json")
            }
        })
    })

    Scrape_btn.onclick = PlayPauseScraper
}

// setInterval(() => {
//     GetData("Log").then(data => {
//         if(data!==null){

//             console.log(data);
//             Msg(data.at, data.msg, data.logType)
//         }
//     })
// }
//     , 1000);