// ==UserScript==
// @name         Export Chat Preply
// @namespace    http://tampermonkey.net/
// @version      1.0
// @description  Scans the Preply chat by simulating scroll to load all messages and export them into a text file.
// @author       eliseall
// @match        https://preply.com/*
// @grant        none
// ==/UserScript==

(function() {
    'use strict';
    const chatContainerSelector = '[data-qa-id="omni-chat"]';

    async function loadEntireChat() {
        const container = document.querySelector(chatContainerSelector);
        if (!container) {
            alert('Chat container not found. Please check the selector.');
            return;
        }
        let previousHeight = 0;
        let newHeight = container.scrollHeight;
        while (newHeight !== previousHeight) {
            previousHeight = newHeight;
            container.scrollTop = 0;
            await new Promise(resolve => setTimeout(resolve, 1500));
            newHeight = container.scrollHeight;
        }
        await new Promise(resolve => setTimeout(resolve, 1000));
    }

    function extractChat() {
        let chat = [];
        let messages = document.querySelectorAll('[data-qa-id="message-text"]');
        messages.forEach(msg => {
            chat.push(msg.innerText.trim());
        });
        return chat;
    }

    function downloadChat(contentArray) {
        const content = contentArray.join('\n\n');
        const blob = new Blob([content], { type: 'text/plain' });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.style.display = 'none';
        a.href = url;
        a.download = 'chat.txt';
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
    }

    const exportButton = document.createElement('button');
    exportButton.textContent = 'Export Complete Chat';
    exportButton.style.position = 'fixed';
    exportButton.style.top = '10px';
    exportButton.style.right = '10px';
    exportButton.style.zIndex = 10000;
    exportButton.style.padding = '10px';
    exportButton.style.backgroundColor = '#007bff';
    exportButton.style.color = '#fff';
    exportButton.style.border = 'none';
    exportButton.style.borderRadius = '4px';
    exportButton.style.cursor = 'pointer';
    document.body.appendChild(exportButton);

    exportButton.addEventListener('click', async () => {
        exportButton.disabled = true;
        exportButton.textContent = 'Loading chat...';
        await loadEntireChat();
        const chat = extractChat();
        if (chat.length > 0) {
            downloadChat(chat);
            alert('Chat exported successfully!');
        } else {
            alert('No message found. Please verify that the selectors match the page structure.');
        }
        exportButton.disabled = false;
        exportButton.textContent = 'Export Complete Chat';
    });
})();
