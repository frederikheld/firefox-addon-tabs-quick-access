'use strict'

import { addToQuickAccessStore } from '../functions/quick-access-store.js'

browser.contextMenus.create({
    id: 'highlight-tab',
    title: browser.i18n.getMessage('contextMenuName'),
    contexts: ['tab']
})

browser.contextMenus.onClicked.addListener(async function (info, tab) {
    switch (info.menuItemId) {
        case 'highlight-tab':
            console.log(info)
            console.log(tab)
            await addToQuickAccessStore(tab.id)
            break
    }
})
