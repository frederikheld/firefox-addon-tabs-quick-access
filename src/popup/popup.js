'use strict'

import { MDCList } from '@material/list'

import { addToQuickAccessStore, removeFromQuickAccessStore, clearQuickAccessStore, isInQuickAccessStore } from '../functions/quick-access-store.js'
import { isActiveTab, getCurrentTabId } from '../functions/tab-utils.js'

document.getElementById('button-clear-list').addEventListener('click', (event) => {
    clearQuickAccessStore()
    clearQuickAccessList()
})

document.getElementById('button-add-current-tab').addEventListener('click', async (event) => {
    const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
    await addToQuickAccessStore(currentTab.id)
    addToQuickAccessList(currentTab.id)
    await setButtonStates(currentTab.id)
})

document.addEventListener('click', async (event) => {
    const eventTargetId = event.target.id

    switch (eventTargetId) {
        case eventTargetId.match(/^list-item-\d+-favicon$/)?.input:
        case eventTargetId.match(/^list-item-\d+-title$/)?.input:
            activateTab(parseInt(eventTargetId.match(/^list-item-(\d+)-title$/)[1]))
            window.close()
            break

        case eventTargetId.match(/^list-item-\d+-remove$/)?.input:
            event.stopImmediatePropagation()
            event.stopPropagation()

            const tabId = parseInt(eventTargetId.match(/^list-item-(\d+)-remove$/)[1])
            await removeFromQuickAccessStore(tabId)
            removeFromQuickAccessList(tabId)
            await setButtonStates(tabId)
            break
    }
})

async function onOpen () {
    await populateQuickAccessList()
    await setButtonStates(await getCurrentTabId())
}

onOpen()


// FUNCTIONS TO MANIPULATE UI IN POPUP

async function setButtonStates (currentTabId) {
    const buttonAddCurrentTabEl = document.getElementById('button-add-current-tab')
    
    if (await isInQuickAccessStore(currentTabId)) {
        buttonAddCurrentTabEl.setAttribute('disabled', true)
    } else {
        buttonAddCurrentTabEl.removeAttribute('disabled')
    }
}


// FUNCTIONS TO MANIPULATE HTML LIST IN POPUP

async function populateQuickAccessList () {

    const listEl = document.getElementById('quick-access-list')

    new MDCList(listEl)

    const result = await browser.storage.local.get(['quickAccessTabs'])
    const quickAccessTabs = result.quickAccessTabs || []

    quickAccessTabs.forEach(async (tabId) => {
        try {
            await _addListItem(listEl, tabId)
        } catch (error) { // tab does not exist (because it was closed in the meantime)
            console.info('Add-On TabsQuickAccess: tab ' + tabId + ' was removed from the store as it was closed in the meantime')
            await removeFromQuickAccessStore(tabId)
        }

    })
}

function addToQuickAccessList (tabId) {
    const listEl = document.getElementById('quick-access-list')

    if (!listEl.children['list-item-' + tabId]) {
        _addListItem(listEl, tabId)
    }
}

function clearQuickAccessList () {
    const listEl = document.getElementById('quick-access-list')
    listEl.replaceChildren()
}

function removeFromQuickAccessList (tabId) {
    const listEl = document.getElementById('quick-access-list')
    const listItemEl = document.getElementById('list-item-' + tabId)
    listEl.removeChild(listItemEl)
}

async function _addListItem (listEl, tabId) {
    const listItemEl = document.createElement('li')
    listItemEl.classList.add('mdc-list-item')
    listItemEl.setAttribute('id', 'list-item-' + tabId)

    let highestTabIndex = 0
    for (const el of listEl.children) {
        if (el.tabIndex > highestTabIndex) {
            highestTabIndex = el.tabIndex
        }
    }
    listItemEl.setAttribute('tabindex', highestTabIndex + 1)

    const currentTabInfo = await browser.tabs.get(tabId)
    if (await isActiveTab(currentTabInfo.id)) {
        listItemEl.classList.add('active-tab')
        // listItemEl.classList.add('mdc-theme--background')
    }

    const listItemGraphicEl = document.createElement('span')
    listItemGraphicEl.classList.add('mdc-list-item__graphic')
    listItemGraphicEl.id = 'list-item-' + tabId + '-favicon'
    listItemGraphicEl.innerHTML = '<img src="' + currentTabInfo.favIconUrl + '"></img>'
    
    listItemEl.appendChild(listItemGraphicEl)

    const listItemTextEl = document.createElement('span')
    listItemTextEl.classList.add('mdc-list-item__text')
    listItemTextEl.id = 'list-item-' + tabId + '-title'
    listItemTextEl.innerHTML = currentTabInfo.title

    listItemEl.appendChild(listItemTextEl)

    const listItemMetaEl = document.createElement('span')
    listItemMetaEl.classList.add('mdc-list-item__meta')
    listItemMetaEl.innerHTML = '<button class="mdc-button button-remove-item" id="list-item-' + tabId + '-remove">x</button>'

    listItemEl.appendChild(listItemMetaEl)

//     const listItemMarkup = `
// <span class="mdc-list-item__graphic" id="list-item-${tabId}-favicon">
//     <img src="${tabInfo.favIconUrl}">
// </span>
// <span class="mdc-list-item__text" id="list-item-${tabId}-title">
//     ${tabInfo.title}
// </span>
// <span class="mdc-list-item__meta">
//     <button class="mdc-button button-remove-item" id="list-item-${tabId}-remove">x</button>
// </span>
// `
//     listItemEl.innerHTML = listItemMarkup

    // listItemEl.addEventListener('click', async (event) => {
    //     activateTab(tabId)
    //     window.close()
    // })


    listEl.appendChild(listItemEl)
}


// FUNCTIONS TO MANIPULATE TABS

function activateTab (tabId) {
    browser.tabs.update(tabId, {
        active: true
    })
}
