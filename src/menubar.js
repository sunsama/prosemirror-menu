import crel from 'crel';
import { Plugin, PluginKey } from 'prosemirror-state';

import { renderGrouped } from './menu';

const prefix = 'selection-toolbar';

// :: (Object) → Plugin
// A plugin that will place a menu bar above the editor. Note that
// this involves wrapping the editor in an additional `<div>`.
//
//   options::-
//   Supports the following options:
//
//     content:: [[MenuElement]]
//     Provides the content of the menu, as a nested array to be
//     passed to `renderGrouped`.
//
//     floating:: ?bool
//     Determines whether the menu floats, i.e. whether it sticks to
//     the top of the viewport when the editor is partially scrolled
//     out of view.
export function menuBar(options) {
    return new Plugin({
        key: new PluginKey('menu'),
        view(editorView) {
            return new MenuBarView(editorView, options);
        }
    });
}

class MenuBarView {
    constructor(editorView, options) {
        this.editorView = editorView;
        this.options = options;

        // this.wrapper = crel('div', { class: prefix + '-wrapper' });
        // this.menu = crel('div', { class: prefix });
        this.menu = crel('div'); 
        this.menu.className = 'selection-toolbar';
        editorView.dom.parentNode.appendChild(this.menu);

        let { dom, update } = renderGrouped(this.editorView, this.options.content);
        this.contentUpdate = update;
        this.menu.appendChild(dom);
        this.update(editorView, null);
    }

    update(view, lastState) {
        console.log('update()');
        const state = view.state;
        // Don't do anything if the document/selection didn't change
        if (lastState && lastState.doc.eq(state.doc) && lastState.selection.eq(state.selection)) {
            return;
        }

        // Hide the menu if the selection is empty
        if (state.selection.empty) {
            this.menu.style.display = 'none';
            return;
        }

        // Otherwise, reposition it and update its content
        this.menu.style.display = '';
        const { from, to } = state.selection;
        // These are in screen coordinates
        const start = view.coordsAtPos(from),
            end = view.coordsAtPos(to);
        // The box in which the menu is positioned, to use as base
        const box = this.menu.offsetParent.getBoundingClientRect();
        // Find a center-ish x position from the selection endpoints (when
        // crossing lines, end may be more to the left)
        const left = Math.max((start.left + end.left) / 2, start.left + 3);
        this.menu.style.left = `${left - box.left}px`;
        this.menu.style.bottom = `${box.bottom - start.top}px`;
    }

    //   update() {
    //     this.contentUpdate(this.editorView.state)

    //     if (this.floating) {
    //       this.updateScrollCursor()
    //     } else {
    //       if (this.menu.offsetWidth != this.widthForMaxHeight) {
    //         this.widthForMaxHeight = this.menu.offsetWidth
    //         this.maxHeight = 0
    //       }
    //       if (this.menu.offsetHeight > this.maxHeight) {
    //         this.maxHeight = this.menu.offsetHeight
    //         this.menu.style.minHeight = this.maxHeight + "px"
    //       }
    //     }
    //   }

    destroy() {
        this.menu.remove();
    }
}