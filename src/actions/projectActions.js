import { scenes, storageRef } from '../firebase.js';

export const ASYNC_USER_PROJ = 'ASYNC_USER_PROJ';
export const SYNC_USER_PROJ = 'SYNC_USER_PROJ';
export const ASYNC_EXAMP_PROJ = 'ASYNC_EXAMP_PROJ';
export const SYNC_EXAMP_PROJ = 'SYNC_EXAMP_PROJ';
export const DELETE_PROJ = 'DELETE_PROJ';

export function asyncUserProj(id) {
  // fetch user's project
  return (dispatch) => {
    if (id) {
      let userVals = [];
      scenes.where('uid', '==', id).get().then(snap => {
        snap.forEach(doc => {
          storageRef.child(`/images/perspective/${doc.id}`)
            .getDownloadURL().then((img) => {
              let dat = doc.data();
              userVals.push({
                name: dat.name,
                id: doc.id,
                data: dat,
                url: img
              });
            });
        });
      });
      dispatch(syncUserProj(userVals));
    }
  };
}

export function syncUserProj(payload) {
  return { type: SYNC_USER_PROJ, payload: payload };
}

export function asyncExampleProj() {
  // fetch example projects
  return (dispatch) => {
    let exampleVals = [];
    scenes.where('uid', '==', '1').get().then(snap => {
      snap.forEach(doc => {
        storageRef.child(`/images/perspective/${doc.id}`)
          .getDownloadURL().then((img) => {
            let dat = doc.data();
            exampleVals.push({
              name: dat.name,
              id: doc.id,
              data: dat,
              url: img
            });
          });
      });
      dispatch(syncExampleProj(exampleVals));
    });
  };
}

export function syncExampleProj(payload) {
  return { type: SYNC_EXAMP_PROJ, payload: payload };
}

export function deleteProj(id, name) {
  if (window.confirm(`Are you sure you want to delete ${name}?`)) {
    // Delete Image
    let path = "images/perspective/" + id;
    let imgRef = storageRef.child(path);

    imgRef.delete().then(() => {
      console.log("Image successfully deleted!");
    }).catch((error) => {
      console.error("Error removing img: ", error);
    });

    // Delete Document
    scenes.doc(id).delete().then(() => {
      console.log("Document successfully deleted!");

      // If deleting current project, redirect to home
      if (window.location.href === window.origin + '/' + id || window.location.href === window.origin + '/' + id + '/') {
        window.location.href = window.origin;
      }
    }).catch((error) => {
      console.error("Error removing document: ", error);
    });
    return { type: DELETE_PROJ, id: id };
  }
}
