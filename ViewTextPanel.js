export class ViewTextPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(extension, id, title) {
      super(extension.viewer.container, id, title);
      this.extension = extension;
      this.text = null;
  }

  async update(regionBox) {
    this.removeAllProperties();
    let stringCount = 1;
    //Now we check which geometries intersect with the bounding box
    for(const text of this.text) {
      if (regionBox.intersectsBox(text.boundingBox)) {
        this.addProperty('String ' + stringCount.toString(), text.string, 'PDF Text');
        stringCount++;
      }
      //You can also change to use regionBox.intersectsBox() or regionBox.containsPoint() or regionBox.containsBox() if you want to check for containment instead of intersection 
      // if( regionBox.containsPoint(text.boundingBox.center())) {
      //   this.addProperty('String ' + stringCount.toString(), text.string, 'Matching Strings');
      //   stringCount++;
      // }
    }
  }
}