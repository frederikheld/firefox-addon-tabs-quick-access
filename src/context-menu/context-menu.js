'use strict'

import { addToQuickAccessStore, isInQuickAccessStore } from '../functions/quick-access-store.js'

browser.contextMenus.create({
    id: 'add-tab-to-quick-access-store',
    title: browser.i18n.getMessage('contextMenuName'),
    contexts: ['tab']
})

browser.contextMenus.onClicked.addListener(async function (info, tab) {
    switch (info.menuItemId) {
        case 'add-tab-to-quick-access-store':
            await addToQuickAccessStore(tab.id)
            break
    }
})

browser.contextMenus.onShown.addListener(async function (info, tab) {
    const inQuickAccessStore = await isInQuickAccessStore(tab.id)

    browser.contextMenus.update('add-tab-to-quick-access-store', {
        enabled: !inQuickAccessStore
    })
    
    browser.contextMenus.refresh()
})
// DOCS: https://developer.mozilla.org/en-US/docs/Mozilla/Add-ons/WebExtensions/API/menus/onShown
