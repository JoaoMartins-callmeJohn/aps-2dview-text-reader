# aps-text-reader

## Introduction

If you're familiar with APS and Viewer you're probably already aware of the methods to retrieve the properties from elements. But what about the text available in your 2D designs? This is what we will cover in this repo.
We are going to build an extension that returns the texts from one specific region in Viewer and write that in a property panel.

## How it works?

First thing we'll do is retrieve all the text from our model, and that's done using the `Autodesk.StringExtractor` extension.

To leverage that, you need to pass one specific option (**extendStringsFetching**) when loading your models, just like this sample does in the snippet below:

```js
viewer.loadDocumentNode(doc, viewables, {
    extendStringsFetching: true
});
```

After that, we can leverage the `Autodesk.StringExtractor` extension, just like done in the snippet below:

```js
async onObjectTreeCreated(event){
this.viewer.loadExtension("Autodesk.StringExtractor")
    .then(() => {
        this.stringExtractor = this.viewer.getExtension('Autodesk.StringExtractor');
        return this.stringExtractor.extractStringsFromModel(this.viewer.model);
    }).then(() => {
        this._panel.text = this.stringExtractor.documentStrings[1].strings;
    }).catch((error) => {
        console.error('Error loading or extracting strings:', error);
    });
}
```

From this point, we have all of our strings available from our panel.
Each  string object has a structure similar to the one below:
```js
{
    angle: 0
    boundingBox: THREE.Box2 {min: THREE.Vector2, max: THREE.Vector2}
    string: "REV."
    stringCharWidths: [722, 667, 667, 278]
    stringHeight: 12.57294
    stringPosition:  [28.298333333333336, 3.998333333333333]
    stringWidth: 29.345241959999996
}
```

## How to filter the text

We'll use the **boundingBox** of the strings to filter those associated with the selected region in our view.
For that, we'll leverage the `Autodesk.BoxSelection` extension in a way that every time the user selects one region, we are going to compare this region's bounding box with the strings bounding box.

We start by reacting to the mouse up event every time the boxselection tool is set to active:

```js
onMouseUp(event) {
    const boxSelectionTool = this.viewer.getExtension('Autodesk.BoxSelection').boxSelectionTool;
    if (boxSelectionTool.isActive()) {
        let startPoint = this.viewer.clientToWorld(boxSelectionTool.startPoint.x, boxSelectionTool.startPoint.y);
        let endPoint = this.viewer.clientToWorld(boxSelectionTool.endPoint.x, boxSelectionTool.endPoint.y);
        //convert to THREE.Vector2
        startPoint = new THREE.Vector2(startPoint.point.x, startPoint.point.y);
        endPoint = new THREE.Vector2(endPoint.point.x, endPoint.point.y);
        const boundingbox = new THREE.Box2(startPoint,endPoint);
        if (this._panel) {
          this._panel.update(boundingbox);
        }
    }
}
```

And inside the panel update function we perform the match

```js
async update(regionBox) {
    this.removeAllProperties();
    let stringCount = 1;
    //Now we check which geometries intersect with the bounding box
    for(const text of this.text) {
        //You can also change to use regionBox.intersectsBox() or regionBox.containsPoint() or regionBox.containsBox() if you want to check for containment instead of intersection 
        if (regionBox.intersectsBox(text.boundingBox)) {
            this.addProperty('String ' + stringCount.toString(), text.string, 'PDF Text');
            stringCount++;
        }
    }
}
```

This comparision cal leverage common bounding box methods like `intersectsBox`, `containsPoint` and `containsBox`. Your choice will affect what the extension matches.

## Tips and Tricks

> Another way to achieve that would be by comparing the bounding box of the selected element with the bouding box of the strings from the model, but that is very error prone due to a considerable amount of reasons: You might be working with a sheet where the same element is present in many viewports, or maybe your text isn't close to any selectable element, or your drawing has many dimensions (the callouts are also considered for the bounding box).
If you wanna give this approach a try, thats available in the [selection_based](https://github.com/JoaoMartins-callmeJohn/aps-pdf-text-reader/tree/selection_based) branch of the source code.

For a better match you might want to adjust the bounding box comparision logic based on the center point of texts.

The text is returned different if you compare legacy format with the PDF one.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

João Martins [in/jpornelas](https://linkedin.com/in/jpornelas)
