export const AddNewData = (key, data) => {
    chrome.storage.local.set({ [key]: data }, () => {
        chrome.storage.local.get([key], (result) => {
            console.log(key,":",result[key]);
            return result[key]
        })
    }
    )
}
export const GetData = (key) => {
    return new Promise((resolve, reject) => {
        chrome.storage.local.get([key], (result) => {
            let data = Boolean(Object.keys(result).length) ? result[key] : []
            if (`${data}`) {
                resolve(data)
            } else {
                resolve(null)
            }
        })
    })
}