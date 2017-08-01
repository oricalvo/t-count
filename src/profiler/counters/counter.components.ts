import * as core from '@angular/core';
import {Counter} from "../core/counter";

const counter: Counter = new Counter("Components", {noAvg: true, noLastValue: true});

export function patch() {
  const originalComponent = core.Component;

  function ComponentEx(objOrType) {
    if (this instanceof ComponentEx) {
      Object.assign(this, objOrType);

      return this;
    }

    var annotationInstance = new (ComponentEx as any)(objOrType);

    var TypeDecorator = (function TypeDecorator(cls) {
      var annotations = Reflect["getOwnMetadata"]('annotations', cls) || [];
      annotations.push(annotationInstance);
      Reflect["defineMetadata"]('annotations', annotations, cls);

      patchComponentType(cls);

      return cls;
    });

    return TypeDecorator;
  }

  ComponentEx.prototype = Object.create(originalComponent.prototype);
  ComponentEx.prototype.toString = function () {
    return "@" + name;
  };

  Object.defineProperty(core, "Component", {
    get: function () {
      return ComponentEx;
    }
  });
}

function patchComponentType(cls) {
    const originalNgOnInit = cls.prototype.ngOnInit;
    cls.prototype.ngOnInit = function() {
      if(counter) {
        counter.inc();
      }

      if(originalNgOnInit) {
        return originalNgOnInit.apply(this, arguments);
      }
    }

    const originalNgOnDestroy = cls.prototype.ngOnDestroy;
    cls.prototype.ngOnDestroy = function() {
      if(counter) {
        counter.dec();
      }

      if(originalNgOnDestroy) {
        return originalNgOnDestroy.apply(this, arguments);
      }
    }
}

export function create() {
  return counter;
}
