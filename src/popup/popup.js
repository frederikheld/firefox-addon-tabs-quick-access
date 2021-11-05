'use strict'

import { MDCList } from '@material/list'

import { addToQuickAccessStore, removeFromQuickAccessStore, clearQuickAccessStore, isInQuickAccessStore } from '../functions/quick-access-store.js'
import { isActiveTab, getCurrentTabId, getObjectsForTabIds } from '../functions/tab-utils.js'

document.getElementById('button-clear-list').addEventListener('click', async (event) => {
    const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
    
    await clearQuickAccessStore()
    clearQuickAccessList()
    await setButtonStates(currentTab.id)
})

document.getElementById('button-add-current-tab').addEventListener('click', async (event) => {
    const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
    
    await addToQuickAccessStore(currentTab.id)
    addToQuickAccessList(currentTab)
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

    const listsContainerEl = document.getElementById('quick-access-lists-container')

    const result = await browser.storage.local.get(['quickAccessTabs'])
    const quickAccessTabsIds = result.quickAccessTabs || []

    const quickAccessTabs = await getObjectsForTabIds(quickAccessTabsIds, true)

    for (const [windowId, windowTabObjects] of Object.entries(quickAccessTabs)) {
        _addList(listsContainerEl, windowId, windowTabObjects)
    }
}

async function addToQuickAccessList (tabObject) {
    let listEl = document.getElementById('quick-access-list-' + tabObject.windowId)

    if (!listEl) {
        const listsContainerEl = document.getElementById('quick-access-lists-container')
        await _addList(listsContainerEl, tabObject.windowId)
        listEl = document.getElementById('quick-access-list-' + tabObject.windowId)
    }

    if (!listEl.children['list-item-' + tabObject.id]) {
        await _addListItem(listEl, tabObject.id)
    }
}

function clearQuickAccessList () {
    const listContainerEl = document.getElementById('quick-access-lists-container')
    listContainerEl.replaceChildren()
}

function removeFromQuickAccessList (tabId) {
    const listItemEl = document.getElementById('list-item-' + tabId)

    if (listItemEl.parentElement.childNodes.length <= 1) {
        listItemEl.parentElement.parentElement.parentElement.removeChild(listItemEl.parentElement.parentElement)
    } else {
        listItemEl.parentElement.removeChild(listItemEl)
    }
}

async function _addList (listsContainerEl, windowId, windowTabObjects = []) {
    const isCurrentWindow = (await browser.windows.getCurrent()).id === parseInt(windowId)

    const listContainerEl = document.createElement('section')
    listContainerEl.classList.add('quick-access-list-container', 'list-' + (isCurrentWindow ? 'primary' : 'secondary'))
    listContainerEl.id = 'quick-access-list-container-' + windowId

    const headingEl = document.createElement('h2')
    headingEl.innerHTML = 'Window ' + windowId + (isCurrentWindow ? ' (current)' : '')

    listContainerEl.append(headingEl)

    const listEl = document.createElement('ul')
    listEl.classList.add('mdc-list', 'quick-access-list')
    listEl.id = 'quick-access-list-' + windowId

    listContainerEl.append(listEl)
    
    new MDCList(listEl)

    for (const tabObject of windowTabObjects) {
        _addListItem(listEl, tabObject.id)
    }

    if (isCurrentWindow) {
        listsContainerEl.prepend(listContainerEl)
    } else {
        listsContainerEl.append(listContainerEl)
    }

    return listContainerEl
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
        listItemEl.classList.add('list-item-active-tab')
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

    listEl.appendChild(listItemEl)

    return listItemEl
}


// FUNCTIONS TO MANIPULATE TABS

function activateTab (tabId) {
    browser.tabs.update(tabId, {
        active: true
    })
}
