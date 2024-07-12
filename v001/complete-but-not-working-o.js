class OComponent {
  constructor(element, props) {
    this.element = element;
    this.props = props;
    this.data = {};
    this.state = {};
    this.eventHandlers = {};
    this.computedProperties = {};
  }

  render() {
    this.element.innerHTML = this.template(this.data);
  }

  update() {
    this.render();
  }

  useState(initialState) {
    let state = initialState;
    const setState = (newState) => {
      state = newState;
      this.update();
    };
    return [state, setState];
  }

  useEffect(callback, dependencies) {
    const dependenciesChanged = dependencies.some((dep, i) => dep !== this.props[i]);
    if (dependenciesChanged) {
      callback();
    }
  }

  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  trigger(event, ...args) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(...args));
    }
  }

  computed(computedProperties) {
    this.computedProperties = computedProperties;
    this.data = { ...this.props, ...this.state, ...this.computedProperties };
  }

  beforeMount() {}
  mounted() {}
  beforeUpdate() {}
  updated() {}
  beforeUnmount() {}
  unmounted() {}

  template(data) {
    return '';
  }
}

class ORouter {
  constructor(basePath) {
    this.basePath = basePath;
    this.routes = new Map();
    this.defaultRoute = null;
    this.eventHandlers = {};

    window.addEventListener('popstate', this.handlePopState.bind(this));
  }

  route(path, componentName) {
    this.routes.set(path, componentName);
  }

  setDefaultRoute(componentName) {
    this.defaultRoute = componentName;
  }

  navigate(path) {
    this.renderComponent(path);
    this.updateURL(path);
  }

  renderComponent(path) {
    const componentName = this.getComponentName(path);
    if (componentName) {
      const component = new o.components[componentName](null, this.getRouteParams(path));
      component.render();
      this.trigger('route-change', component);
    } else {
      this.handleNotFound(path);
    }
  }

  updateURL(path) {
    const url = `${this.basePath}${path}`;
    window.history.pushState({}, '', url);
  }

  handlePopState() {
    this.renderComponent(window.location.pathname);
  }

  handleNotFound(path) {
    if (this.defaultRoute) {
      this.navigate('/');
    } else {
      console.error(`Route not found: ${path}`);
    }
  }

  getComponentName(path) {
    for (const [route, componentName] of this.routes) {
      const regex = this.getRouteRegex(route);
      if (regex.test(path)) {
        return componentName;
      }
    }
    return null;
  }

  getRouteParams(path) {
    for (const [route, componentName] of this.routes) {
      const regex = this.getRouteRegex(route);
      const match = path.match(regex);
      if (match) {
        const params = {};
        route.split('/').forEach((segment, i) => {
          if (segment.startsWith(':')) {
            const paramName = this.getParamName(segment);
            params[paramName] = match[i + 1];
          }
        });
        return params;
      }
    }
    return {};
  }

  getRouteRegex(route) {
    return new RegExp(`^${route.replace(/:\w+/g, '(\\w+)')}$`);
  }

  getParamName(segment) {
    return segment.slice(1);
  }

  on(event, handler) {
    if (!this.eventHandlers[event]) {
      this.eventHandlers[event] = [];
    }
    this.eventHandlers[event].push(handler);
  }

  trigger(event, ...args) {
    if (this.eventHandlers[event]) {
      this.eventHandlers[event].forEach(handler => handler(...args));
    }
  }
}

class ODependencyInjector {
  constructor() {
    this.dependencies = new Map();
  }

  register(name, dependency) {
    this.dependencies.set(name, dependency);
  }

  get(name) {
    const dependency = this.dependencies.get(name);
    if (!dependency) {
      throw new Error(`Dependency "${name}" not found.`);
    }
    return dependency;
  }
}

class OEventEmitter {
  constructor() {
    this.events = new Map();
  }

  on(event, callback) {
    if (!this.events.has(event)) {
      this.events.set(event, []);
    }
    this.events.get(event).push(callback);
  }

  off(event, callback) {
    if (this.events.has(event)) {
      this.events.set(event, this.events.get(event).filter(cb => cb !== callback));
    }
  }

  emit(event, ...args) {
    if (this.events.has(event)) {
      this.events.get(event).forEach(callback => callback(...args));
    }
  }
}

class OPlugin {
  constructor(name, setup) {
    this.name = name;
    this.setup = setup;
  }

  install() {
    this.setup(o);
  }
}

class ODirective {
  constructor(name, setup) {
    this.name = name;
    this.setup = setup;
  }

  bind(el, binding, vnode) {
    this.setup(el, binding, vnode);
  }

  update(el, binding, vnode, oldVnode) {
    this.setup(el, binding, vnode, oldVnode);
  }

  unbind(el, binding, vnode) {
    this.setup(el, binding, vnode);
  }
}

class OAsyncComponent extends OComponent {
  constructor(element, props) {
    super(element, props);
    this.loadingComponent = null;
  }

  async render() {
    if (!this.loadingComponent) {
      this.loadingComponent = await this.loadComponent();
    }
    const html = this.loadingComponent.template(this.data);
    this.element.innerHTML = html;
  }

  async loadComponent() {
    // Load the component dynamically and return an instance of OComponent
    throw new Error('Implement the loadComponent method to load the component dynamically.');
  }
}

// const o = {
//   OComponent,
//   components: {},
//   directives: {},
//   transitions: {},
//   data: {},
//   injector: new ODependencyInjector(),
//   eventEmitter: new OEventEmitter(),

//   component(name, component) {
//     this.components[name] = component;
//   },

//   data(data) {
//     this.data = data;
//   },

//   route(path, componentName) {
//     this.router.route(path, componentName);
//   },

//   setDefaultRoute(componentName) {
//     this.router.setDefaultRoute(componentName);
//   },

//   navigate(path) {
//     this.router.navigate(path);
//   },

//   directive(name, setup) {
//     this.directives[name] = new ODirective(name, setup);
//   },

//   applyDirectives(el, vnode) {
//     Object.values(this.directives).forEach(directive => {
//       directive.bind(el, vnode.data.directives.find(d => d.name === directive.name), vnode);
//     });
//   },

//   transition(name, setup) {
//     this.transitions[name] = setup;
//   },

//   applyTransition(el, transition, props) {
//     const transitionSetup = this.transitions[transition];
//     if (transitionSetup) {
//       transitionSetup(el, props);
//     }
//   },

//   asyncComponent(name, loadComponent) {
//     this.components[name] = class extends OAsyncComponent {
//       loadComponent() {
//         return loadComponent();
//       }
//     };
//   },

//   use(plugin) {
//     if (plugin instanceof OPlugin) {
//       plugin.install();
//     } else if (typeof plugin === 'function') {
//       plugin(this);
//     } else {
//       throw new Error('Invalid plugin format. Plugins must be an instance of OPlugin or a function.');
//     }
//   },

//   devTools: {
//     componentTree: function() {
//       // Implement a component tree viewer
//     },
//     stateInspector: function() {
//       // Implement a state inspector
//     },
//     performanceProfiler: function() {
//       // Implement a performance profiler
//     }
//   },

//   renderToString(componentName, props) {
//     const component = new this.components[componentName](null, props);
//     return component.template(component.data);
//   },

//   mount(callback) {
//     this.router = new ORouter('/');
//     this.navigate(window.location.pathname);
//     callback();
//   }
// };

const o = {
  OComponent,
  ORouter,
  ODependencyInjector,
  OEventEmitter,
  OPlugin,
  ODirective,
  OAsyncComponent,
  component: (name, component) => {
    o[name] = component;
  },
  route: (path, componentName) => {
    o.router.route(path, componentName);
  },
  setDefaultRoute: (componentName) => {
    o.router.setDefaultRoute(componentName);
  },
  navigate: (path) => {
    o.router.navigate(path);
  },
  mount: (callback) => {
    o.router = new ORouter('/');
    callback();
  }
};

export default o;
