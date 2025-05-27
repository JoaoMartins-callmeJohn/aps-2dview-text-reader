# aps-text-reader

## Introduction

If you're familiar with APS and Viewer you're probably already aware of the methods to retrieve the properties from elements. But what about the text available in your 2D designs? This is what we will cover in this repo.
We are going to build an extension that returns the texts from the selected element in Viewer and writa that in a property panel.

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
In our sample, we'll use the **boundingBox** to filter the strings associated with the selected elements in our view.
For that, we'll react to the **SELECTION_CHANGED_EVENT** in a way that every time the user selects some element, we are going to compare this element's bounding box with the strings bounding box.

This comparision cal leverage common bounding box methods like `intersectsBox`, `containsPoint` and `containsBox`. Your choice will affect what the extension matches.

 > To find the selected elements bounding box we used the same approach explanied at https://aps.autodesk.com/blog/working-2d-and-3d-scenes-and-geometry-forge-viewer

## Tips and Tricks

For a better match you might want to adjust the bounding box comparision logic based on the center point of texts.
Dimensions are trickier as the callouts are also considered for the bounding boxes.

## License

This sample is licensed under the terms of the [MIT License](http://opensource.org/licenses/MIT). Please see the [LICENSE](LICENSE) file for full details.

## Written by

João Martins [in/jpornelas](https://linkedin.com/in/jpornelas)
