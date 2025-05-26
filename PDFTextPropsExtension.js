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

import { PDFTextPropsPanel } from './PDFTextPropsPanel.js';

class PDFTextPropsExtension extends Autodesk.Viewing.Extension{
  constructor(viewer, options) {
    super(viewer, options);
    this._button = null;
    this._panel = null;
    viewer.addEventListener(Autodesk.Viewing.SELECTION_CHANGED_EVENT, this.onSelectionChanged.bind(this));
    viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this.onObjectTreeCreated.bind(this));
  }

  onToolbarCreated(toolbar) {
    this._panel = new PDFTextPropsPanel(this, 'pdf-text-props-panel', 'PDF Text Properties');
    this._button = this.createToolbarButton('pdf-text-props-button', 'https://img.icons8.com/ios/30/share-2--v1.png', 'PDF Text Properties');
    this._button.onClick = async () => {
      this._panel.setVisible(!this._panel.isVisible());
      this._button.setState(this._panel.isVisible() ? Autodesk.Viewing.UI.Button.State.ACTIVE : Autodesk.Viewing.UI.Button.State.INACTIVE);
    };
  }

  async onObjectTreeCreated(event){
    await this.viewer.loadExtension("Autodesk.StringExtractor")
    this.stringExtractor = this.viewer.getExtension('Autodesk.StringExtractor')
    await this.stringExtractor.extractStringsFromModel(this.viewer.model)
    this._panel.text  = this.stringExtractor.documentStrings[1].strings
  }

  onSelectionChanged(event) {
    this._panel.update(event.dbIdArray);
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
    console.log('PDF Text Properties Extension has been loaded.');
    this.viewer.addEventListener(Autodesk.Viewing.OBJECT_TREE_CREATED_EVENT, this._onObjectTreeCreated);
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

Autodesk.Viewing.theExtensionManager.registerExtension('PDFTextPropsExtension', PDFTextPropsExtension);