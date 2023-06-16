// Display a log message indicating the start of the scraper
console.log("💥 Content Script.....");

// Initialize an empty array to store collected jobs
var CollectedJobs = [];
var nextBtn;
var startScraper = false;
// Function to extract data from a job container and store it in the CollectedJobs array
const ExtractData = (container) => {
    CollectedJobs.push({
        Title: container.querySelector("h2").innerText,
        Budget: container.querySelector(".BudgetUpgradeWrapper-budget div").innerText.replace("Budget", "").trim(),
        Tech: container.querySelector("fl-bit[data-margin-bottom='xsmall']").innerText.split("\n"),
        shortDesc: container.querySelector("[data-max-lines] div").innerText,
        url: container.closest("a").href
    });
};

const GetPageNo = () => {
    var params = new URLSearchParams(window.location.href);
    var pageNo = params.get("page");
    return pageNo ? parseInt(pageNo) : 1
}


// Main scraper function
const Scraper = () => {
    console.log("💖 Scraping....");
    var pageNo = GetPageNo()

    var jobs = document.querySelectorAll("fl-project-contest-card");
    jobs.forEach((job) => ExtractData(job));

    chrome.runtime.sendMessage({ type: "Add", data: CollectedJobs },
        (response) => {
            console.log("Content 👉 Background : ", { type: "Add", status: response, description: `Store Jobs of Page ${pageNo}` });

            chrome.runtime.sendMessage({ type: "logMsg", data: `📃 Data Extracted from Page : ${pageNo}`,type:"success" },
                (response) => {
                    console.log("Content 👉 Background : ", { type: "logMsg", status: response, description: "Log Changes in popup Terminal" });
                    CollectedJobs = []

                    let nextPageBtn=document.querySelector("fl-bit.PaginationItem[data-show-mobile]:nth-of-type(4) button")
                    if (!nextPageBtn.disabled) {
                        nextPageBtn.click()
                        console.log("Navigating to Next Page 👉");
                        WaitForContent(true)
                    } else {
                        console.log("👩‍💻 No More Pages");
                        startScraper = false
                    }
                    
                })
        })

};
const WaitForContent = (scrape_allowed) => {
    if (!startScraper) {
        console.log("Scraper Stoped");
        return null
    }
    if (document.querySelector("fl-project-contest-card")) {
        console.log('✅ Projects Loaded');
        if (scrape_allowed) {
            Scraper()
        }
    } else {
        // Element doesn't exist, wait and check again
        console.log('👩‍💻 Waiting....');
        setTimeout(() => WaitForContent(scrape_allowed), 1000); // Check again after 1 second (adjust the delay as needed)
    }
}


window.addEventListener("load", () => {
    WaitForContent(false)
});

chrome.runtime.onMessage.addListener((message, sender, sendResponse) => {
    console.log("Background 👉 Content : ", message);
    if (message.type === "StartScraping") {
        startScraper = true
        sendResponse(200)
        Scraper();
    } else if (message.type === "StopScraping") {
        startScraper = false
        sendResponse(200)
    }
    sendResponse("Error 💥")
})