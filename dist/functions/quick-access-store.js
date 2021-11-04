'use strict'

// FUNCTIONS TO MANIPULATE QUICK ACCESS STORE:

async function addToQuickAccessStore (tabId) {
    const result = await browser.storage.local.get(['quickAccessTabs'])
    const quickAccessTabs = result.quickAccessTabs || []

    if (quickAccessTabs.indexOf(tabId) < 0) {
        quickAccessTabs.push(tabId)
    }

    await browser.storage.local.set({ 'quickAccessTabs': quickAccessTabs })
}

async function removeFromQuickAccessStore (tabId) {
    const result = await browser.storage.local.get(['quickAccessTabs'])
    const quickAccessTabs = result.quickAccessTabs || []

    const index = quickAccessTabs.indexOf(tabId)
    if (index > -1) {
        quickAccessTabs.splice(index, 1)
    }

    await browser.storage.local.set({ 'quickAccessTabs': quickAccessTabs })
}

async function clearQuickAccessStore () {
    await browser.storage.local.set({ 'quickAccessTabs': [] })
}

exports = {
    addToQuickAccessStore,
    removeFromQuickAccessStore,
    clearQuickAccessStore
}