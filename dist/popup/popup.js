'use strict'

           
document.addEventListener('click', async (event) => {
    console.log('click event:', event)

    const eventTargetId = event.target.id

    console.log('eventTargetId:', eventTargetId)

    switch (eventTargetId) {
        case 'clear-list':
            clearQuickAccessStore()
            clearQuickAccessList()
            break
        
        case eventTargetId.match(/^list-item-\d+-favicon$/)?.input:
        case eventTargetId.match(/^list-item-\d+-title$/)?.input:
            activateTab(parseInt(eventTargetId.match(/^list-item-(\d+)-title$/)[1]))
            window.close()
            break

        case eventTargetId.match(/^list-item-\d+-remove$/)?.input:
            await removeFromQuickAccessStore(parseInt(eventTargetId.match(/^list-item-(\d+)-remove$/)[1]))
            removeFromQuickAccessList(parseInt(eventTargetId.match(/^list-item-(\d+)-remove$/)[1]))
            break

        case 'add-current-tab':
            const currentTab = (await browser.tabs.query({ active: true, currentWindow: true }))[0]
            console.log('currentTab:', currentTab.id)
            await addToQuickAccessStore(currentTab.id)
            addToQuickAccessList(currentTab.id)
            break
    }
})


async function onOpen () {
    await populateQuickAccessList()

    try {
        browser
        const debugEl = document.getElementById('debug-html')
        debugEl.style.display = 'none'
    } catch (error) {
        console.log(error)
    }
}

onOpen()


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

    console.log('quickAccessTabs BEFORE removing ' + tabId + ':', quickAccessTabs)

    const index = quickAccessTabs.indexOf(tabId)
    if (index > -1) {
        quickAccessTabs.splice(index, 1)
    }

    console.log('quickAccessTabs AFTER removing ' + tabId + ':', quickAccessTabs)

    await browser.storage.local.set({ 'quickAccessTabs': quickAccessTabs })
}

async function clearQuickAccessStore () {
    await browser.storage.local.set({ 'quickAccessTabs': [] })
}


// FUNCTIONS TO MANIPULATE HTML LIST IN POPUP

async function populateQuickAccessList () {

    const MDCList = mdc.list.MDCList

    const listEl = document.getElementById('quick-access-list')

    new MDCList(listEl)

    const result = await browser.storage.local.get(['quickAccessTabs'])
    const quickAccessTabs = result.quickAccessTabs || []

    quickAccessTabs.forEach(async (tabId) => {
        try {
            await _addListItem(listEl, tabId)
        } catch (error) { // tab does not exist (because it was closed in the meantime)
            console.log('tab ' + tabId + ' was removed from the store as it was closed in the meantime')
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

    const tabInfo = await browser.tabs.get(tabId)

    console.log('tabInfo:', tabInfo)

    const listItemMarkup = `
<span class="mdc-list-item__graphic" id="list-item-${tabId}-favicon">
    <img src="${tabInfo.favIconUrl}">
</span>
<span class="mdc-list-item__text" id="list-item-${tabId}-title">
    ${tabInfo.title}
</span>
<span class="mdc-list-item__meta">
    <button class="mdc-button button-remove-item" id="list-item-${tabId}-remove">x</button>
</span>
`
    listItemEl.innerHTML = listItemMarkup


    listEl.appendChild(listItemEl)
}


// FUNCTIONS TO MANIPULATE TABS

function activateTab (tabId) {
    browser.tabs.update(tabId, {
        active: true
    })
}
