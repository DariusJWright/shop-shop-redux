export function pluralize(name, count) {
  if (count === 1) {
    return name
  }
  return name + 's'
}

export function idbPromise(storeName, method, object) {
  return new Promise((resolve, reject) => {
    // open connection to the DB 'shop-shop' with a version of 1
    const request = window.indexedDB.open('shop-shop', 1);

    // create variables to hold reference to the DB, transaction (tx), and object store
    let db, tx, store;

    // If version has changed (or if this is the first time using the DB), run this method and create the three object stores
    request.onupgradeneeded = e => {
      const db = request.result;
      // create object store for each type of data and set 'primary' key index to be the '_id' of the data
      db.createObjectStore('products', { keyPath: '_id' });
      db.createObjectStore('categories', { keyPath: '_id' });
      db.createObjectStore('cart', { keyPath: '_id' });
    };

    // handle any error with connecting
    request.onerror = e => {
      console.log('There was an error')
    }

    // on DB open success
    request.onsuccess = e => {
      // save a reference of the DB to the 'db' variables
      db = request.result;
      // open a transaction to whatever we pass into 'storeName' ( must match one of the object store names)
      tx = db.transaction(storeName, 'readwrite');
      // save a reference to that object store
      store = tx.objectStore(storeName);

      // if they're any errors, let us know
      db.onerror = e => {
        console.log('error', e);
      };
      
      // changes depending on what was passed in as 'method'
      switch (method) {
        case 'put':
          store.put(object);
          resolve(object);
          break;
        case 'get':
          const all = store.getAll();
          all.onsuccess = () => {
            resolve(all.result);
          };
          break;
        case 'delete':
          store.delete(object._id);
          break;
        default:
          console.log('No valid method');
          break;
      };

      // when transaction is complete, close the connection
      tx.oncomplete = () => {
        db.close();
      };
    };
  });
};
