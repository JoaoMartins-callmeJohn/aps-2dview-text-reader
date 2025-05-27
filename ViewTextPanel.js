export class ViewTextPanel extends Autodesk.Viewing.UI.PropertyPanel {
  constructor(extension, id, title) {
      super(extension.viewer.container, id, title);
      this.extension = extension;
      this.text = null;
  }

  async update(dbIdArray) {
    this.removeAllProperties();
    for (const dbId of dbIdArray) {
      //first we retrieve the bounding boxes from the selected ids
      let bounds = new THREE.Box3();
      let boundsCallback = new Autodesk.Viewing.Private.BoundsCallback(bounds);
      const fragId = viewer.model.getData().fragments.dbId2fragId[dbId];
      if(typeof fragId === 'object') {
        for(const id of fragId) {
          const mesh = viewer.model.getFragmentList().getVizmesh(id);
          const vbr = new Autodesk.Viewing.Private.VertexBufferReader(mesh.geometry, viewer.impl.use2dInstancing);
          vbr.enumGeomsForObject(dbId, boundsCallback); // Update bounds based on all primitives linked to our dbId
        }
      }
      else{
        const mesh = viewer.model.getFragmentList().getVizmesh(fragId);
        const vbr = new Autodesk.Viewing.Private.VertexBufferReader(mesh.geometry, viewer.impl.use2dInstancing);
        vbr.enumGeomsForObject(dbId, boundsCallback);
      }
      // console.log(bounds);
      
      let stringCount = 1;
      //Now we check which geometries intersect with the bounding box
      for(const text of this.text) {
        if (bounds.intersectsBox(text.boundingBox)) {
          this.addProperty('String ' + stringCount.toString(), text.string, 'PDF Text');
          stringCount++;
        }
        //You can also change to use bounds.containsPoint() or bounds.containsBox() if you want to check for containment instead of intersection 
        // if( bounds.containsPoint(text.boundingBox.center())) {
        //   this.addProperty('String ' + stringCount.toString(), text.string, 'Matching Strings');
        //   stringCount++;
        // }
      }
      
    }
  }
}