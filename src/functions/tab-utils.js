'use strict'

// @PERFORMANCE: push around objects instead if id's to avoid
// repetitive querying of objects?


async function isActiveTab (tabId) {
    const currentTabInfo = await browser.tabs.get(tabId)
    const activeTabInfo = (await browser.tabs.query({ active: true })).filter(item => item.windowId === currentTabInfo.windowId)[0]
    return activeTabInfo.id === tabId
}

async function getCurrentTabId() {
    const currentWindow = await browser.windows.getCurrent()
    const currentTab = (await browser.tabs.query({ active: true })).filter(item => item.windowId === currentWindow.id)[0]

    return currentTab.id
}

export {
    isActiveTab,
    getCurrentTabId
}