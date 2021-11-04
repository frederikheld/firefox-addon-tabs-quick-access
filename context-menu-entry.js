'use strict'

browser.contextMenus.create({
    id: 'highlight-tab',
    title: browser.i18n.getMessage('contextMenuName'),
    contexts: ['tab']
})

browser.browserAction.onClicked.addListener(async function () {
    console.log('browser action clicked!')
})

browser.contextMenus.onClicked.addListener(async function (info, tab) {
    switch (info.menuItemId) {
        case 'highlight-tab':
            console.log(info)
            console.log(tab)
            // browser.tabs.update(tab.id, {
            //     pinned: true
            // })
            // setPageMetaThemeColor('orange')
            // setRootCSSSiteThemeColor('#e3224f')
            // setBrowserThemeColor(tab.windowId, [ 20, 115, 130 ])
            // await setBrowserThemeColor(tab.windowId, '#e3224f')
            // await setTabsCssThemeColor(tab.id, 'red')
            await addTabToQickAccessMenu(tab.id)
            break
    }
})

async function addTabToQickAccessMenu (tabId) {
    const result = await browser.storage.local.get(['quickAccessTabs'])
    const quickAccessTabs = result.quickAccessTabs || []

    quickAccessTabs.push(tabId)
    await browser.storage.local.set({ 'quickAccessTabs': quickAccessTabs })
}

async function setTabsCssThemeColor (tabId, rgbColorString) {
    console.log('tabId:', tabId)

    await browser.tabs.insertCSS(tabId, {
        // code: 'html { background: 5px solid red; } :root { --toolbar-field-border-color: red !important; }',
        // code: ' :root { --lwt-text-color: red; }',
        // code: 'body { border: 5px solid red; } :root { --site-theme-color: ' + rgbColorString + ' }',
        // code: ':root { --site-theme-color: red !important }',
        code: '.tab-stack: { border: 1px solid green !important; }',
        cssOrigin: 'user'
    })

}

function setUserChromeCssThemeColor () {

}

/**
 * This only works for windows, not for single tabs!
 * 
 * @param {*} windowId 
 * @param {*} rgbColorString 
 */
async function setBrowserThemeColor (windowId, rgbColorString) {
    const theme = await browser.theme.getCurrent ()

    theme.colors.tab_line = 'blue'
    theme.colors.tab_background_text = 'green'

    browser.theme.update(windowId, theme)
}

/**
 * See docs for compatibility: https://developer.mozilla.org/en-US/docs/Web/HTML/Element/meta/name/theme-color
 * 
 * @param {*} rgbColorString 
 */
function setPageMetaThemeColor (rgbColorString) {
    let metaThemeColorEl = document.querySelector('meta[name=theme-color]')
    console.log('metaThemeColorEl (found in page):', metaThemeColorEl)

    if (!metaThemeColorEl) {
        const headEl = document.querySelector('head')
        metaThemeColorEl = document.createElement('meta')
        metaThemeColorEl.setAttribute('name', 'theme-color')
        headEl.appendChild(metaThemeColorEl)
        // console.log('headEl:', headEl)
    }

    metaThemeColorEl.setAttribute('content', rgbColorString)
    console.log('metaThemeColorEl (after modification):', metaThemeColorEl)
}

function setRootCSSSiteThemeColor (rgbColorString) {
    let rootEl = document.querySelector(':root')
    rootEl.style['accent-color'] = rgbColorString
    console.log(rootEl)
    console.log(rootEl.style)
}