module.exports = (sails) ->

  hook = {routes: {}}
  generators = {}

  upper = (str) -> "#{str or ""}".toUpperCase()
  lower = (str) -> "#{str or ""}".toLowerCase()
  isarr = (x) -> Array.isArray x
  isarr.or = (x, o) -> if isarr x then x else o
  isarr.or.empty = (x) -> isarr.or x, []
  isarr.or.falsey = (x) -> isarr.or x, false

  normalizePath = (parts...) -> (parts.join "/").replace /\/{2,}/g, "/"

  DEFAULT_SHORTHANDS = [
    "get", "post", "patch", "destroy:delete"
  ]

  RESOURCE_METHODS =
    FIND: {method: "get", fn: "find", path: ""}
    CREATE: {method: "post", fn: "create", path: ""}
    UPDATE: {method: "patch", fn: "update", path: "/:id"}
    FIND_ONE: {method: "get", fn: "findOne", path: "/:id"}
    DESTROY: {method: "delete", fn: "destroy", path: "/:id"}

  registerShorthands = (mappings) ->
    for mapping in mappings
      [fn, method] = mapping.split ":"
      method ||= upper fn
      generators[lower fn] = shorthandGenerator method

  generators.group = (scope) ->
    handler = (level, gen) ->
      original = scope.level
      scope.level = normalizePath scope.level, level
      gen()
      scope.level = original

    handler

  makeRoute = (method, path, target) ->
    result =
      method: upper method
      path: path
      target: target
    result

  generators.route = (scope) ->
    handler = (method_path, mapping) ->
      [method, path] = method_path.split " "
      level_path = normalizePath scope.level, path
      route = makeRoute method, level_path, mapping
      scope.routes.push route

    handler

  generators.resource = (scope) ->
    exceptions = (extras) ->
      excludes = isarr.or.empty extras?.excludes
      whitelist = isarr.or.falsey extras?.only

      handler = (method) ->
        excluded = (excludes.indexOf method) != -1
        explicitly_included = whitelist and ~(whitelist.indexOf method)
        return true if whitelist and not explicitly_included
        return false if explicitly_included
        excluded

      handler

    handler = (resource_name, controller, extras) ->
      resource_path = normalizePath scope.level, resource_name
      excludes = exceptions extras

      for name, config of RESOURCE_METHODS
        continue if excludes config.fn
        action_path = "#{resource_path}#{config.path}"
        action_mapping = "#{controller}.#{config.fn}"
        route = makeRoute config.method, action_path, action_mapping
        scope.routes.push route

      true

    handler

  shorthandGenerator = (method) ->
    generator = (scope) ->
      handler = (path, mapping) ->
        (generators.route scope)("#{upper method} #{path}", mapping)
      handler

    generator

  registerShorthands DEFAULT_SHORTHANDS

  factory = (generator) ->
    scope = {level: "", routes: []}

    for name, fn of generators
      @[name] = fn(scope)

    generator this

    scope.routes

  buildRouteConfig = (constructed_routes) ->
    result = {}

    for route in constructed_routes
      method_path = "#{upper route.method} #{route.path}"
      result[method_path] = route.target

    result

  hook.initialize = (cb) ->
    applyFactory = ->
      gen = sails.config.routefactory
      routes = factory gen
      hook.routes.before = buildRouteConfig routes
      cb false, routes

    sails.after ["hook:userconfig:loaded"], applyFactory

  hook
