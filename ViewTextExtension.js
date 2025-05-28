//
// Copyright (c) Autodesk, Inc. All rights reserved
//
// Permission to use, copy, modify, and distribute this software in
// object code form for any purpose and without fee is hereby granted,
// provided that the above copyright notice appears in all copies and
// that both that copyright notice and the limited warranty and
// restricted rights notice below appear in all supporting
// documentation.
//
// AUTODESK PROVIDES THIS PROGRAM "AS IS" AND WITH ALL FAULTS.
// AUTODESK SPECIFICALLY DISCLAIMS ANY IMPLIED WARRANTY OF
// MERCHANTABILITY OR FITNESS FOR A PARTICULAR USE.  AUTODESK, INC.
// DOES NOT WARRANT THAT THE OPERATION OF THE PROGRAM WILL BE
// UNINTERRUPTED OR ERROR FREE.
//

import { ViewTextPanel } from './ViewTextPanel.js';

class ViewTextExtension extends Autodesk.Viewing.Extension{
  constructor(viewer, options) {
    super(viewer, options);
    this._button = null;
    this._panel = null;
    //add event listener to mouse up event
    document.addEventListener('mouseup', this.onMouseUp.bind(this));
    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this.onObjectTreeCreated.bind(this));
  }

  onToolbarCreated(toolbar) {
    this._panel = new ViewTextPanel(this, 'text-props-panel', 'Selected Element Text');
    this._button = this.createToolbarButton('text-props-button', 'https://img.icons8.com/ios/50/text.png', 'Selected Element Text');
    this._button.onClick = async () => {
      this._panel.setVisible(!this._panel.isVisible());
      this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
    };
  }

  async onObjectTreeCreated(event){
    this.viewer.loadExtension("Autodesk.StringExtractor")
      .then(() => {
        this.stringExtractor = this.viewer.getExtension('Autodesk.StringExtractor');
        return this.stringExtractor.extractStringsFromModel(this.viewer.model);
      }).then(() => {
        this._panel.text = Object.values(this.stringExtractor.documentStrings)[0].strings;
      }).catch((error) => {
        console.error('Error loading or extracting strings:', error);
      });
  }

  onMouseUp(event) {
    const boxSelectionTool = this.viewer.getExtension('Autodesk.BoxSelection').boxSelectionTool;
    if (boxSelectionTool.isActive()) {
        let startPoint = this.viewer.clientToWorld(boxSelectionTool.startPoint.x, boxSelectionTool.startPoint.y);
        let endPoint = this.viewer.clientToWorld(boxSelectionTool.endPoint.x, boxSelectionTool.endPoint.y);
        //convert to THREE.Vector2
        startPoint = new THREE.Vector2(startPoint.point.x, startPoint.point.y);
        endPoint = new THREE.Vector2(endPoint.point.x, endPoint.point.y);
        // find the point with min y and use it as the start point
        if (startPoint.y > endPoint.y) {
          const temp = startPoint;
          startPoint = endPoint;
          endPoint = temp;
        }
        const boundingbox = new THREE.Box2(startPoint,endPoint);
        if (this._panel) {
          this._panel.update(boundingbox);
        }
      }
  }

  createToolbarButton(buttonId, buttonIconUrl, buttonTooltip) {
    let group = this.viewer.toolbar.getControl('properties-toolbar-group');
    if (!group) {
      group = new Autodesk.Viewing.UI.ControlGroup('properties-toolbar-group');
      this.viewer.toolbar.addControl(group);
    }
    const button = new Autodesk.Viewing.UI.Button(buttonId);
    button.setToolTip(buttonTooltip);
    group.addControl(button);
    const icon = button.container.querySelector('.adsk-button-icon');
    if (icon) {
      icon.style.backgroundImage = `url(${buttonIconUrl})`;
      icon.style.backgroundSize = `24px`;
      icon.style.backgroundRepeat = `no-repeat`;
      icon.style.backgroundPosition = `center`;
    }
    return button;
  }

  removeToolbarButton(button) {
    const group = this.viewer.toolbar.getControl('properties-toolbar-group');
    group.removeControl(button);
  }

  async load() {
    console.log('View Text Extension has been loaded.');
    return true;
  }

  unload() {
    if (this._button) {
      this.removeToolbarButton(this._button);
      this._button = null;
    }
    if (this._panel) {
      this._panel.setVisible(false);
      this._panel.uninitialize();
      this._panel = null;
    }
    return true;
  }
}

Autodesk.Viewing.theExtensionManager.registerExtension('ViewTextExtension', ViewTextExtension);