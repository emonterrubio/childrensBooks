class module.exports extends Layer
		
	constructor: (options={}) ->
		options.width ?= Screen.width
		options.height ?= Screen.height
		options.clip ?= true
		options.initialViewName ?= 'initialView'
		options.backButtonName ?= 'backButton'
		options.animationOptions ?= curve: "cubic-bezier(0.19, 1, 0.22, 1)", time: .7
		options.backgroundColor ?= "black"
		options.scroll ?= false
		options.autoLink ?= true

		super options
		@history = []

		@onChange "subLayers", (changeList) =>
			view = changeList.added[0]
			if view?
				# default behaviors for views
				view.clip = true
				view.on Events.Click, -> return # prevent click-through/bubbling
				# add scrollcomponent
				if @scroll
					children = view.children
					scrollComponent = new ScrollComponent
						name: "scrollComponent"
						width: @width
						height: @height
						parent: view
					scrollComponent.content.backgroundColor = ""
					if view.width <= @width
						scrollComponent.scrollHorizontal = false
					if view.height <= @height
						scrollComponent.scrollVertical = false
					for c in children
						c.parent = scrollComponent.content
					view.scrollComponent = scrollComponent # make it accessible as a property
					# reset size since content moved to scrollComponent. prevents scroll bug when dragging outside.
					view.size = {width: @width, height: @height}

		transitions =
			switchInstant:
				newView:
					to: {x: 0, y: 0}
			fadeIn:
				newView:
					from: {opacity: 0}
					to: {opacity: 1}
			zoomIn:
				newView:
					from: {scale: 0.8, opacity: 0}
					to: {scale: 1, opacity: 1}
			zoomOut:
				oldView:
					to: {scale: 0.8, opacity: 0}
			slideInUp:
				newView:
					from: {y: @height}
					to: {y: 0}
			slideInRight:
				newView:
					from: {x: @width}
					to: {x: 0}
			slideInDown:
				newView:
					from: {maxY: 0}
					to: {y: 0}
			moveInRight:
				oldView:
					to: {maxX: 0}
				newView:
					from: {x: @width}
					to: {x: 0}
			moveInLeft:
				oldView:
					to: {x: @width}
				newView:
					from: {maxX: 0}
					to: {x: 0}
			slideInLeft:
				newView:
					from: {maxX: 0}
					to: {maxX: @width}
			pushInRight:
				oldView:
					to: {x: -(@width/5), brightness: 70}
				newView:
					from: {x: @width}
					to: {x: 0}
			pushInLeft:
				oldView:
					to: {x: @width/5, brightness: 70}
				newView:
					from: {x: -@width}
					to: {x: 0}
			pushOutRight:
				oldView:
					to: {x: @width}
				newView:
					from: {x: -(@width/5), brightness: 70}
					to: {x: 0, brightness: 100}
			pushOutLeft:
				oldView:
					to: {maxX: 0}
				newView:
					from: {x: @width/5, brightness: 70}
					to: {x: 0, brightness: 100}
			slideOutUp:
				oldView:
					to: {maxY: 0}
			slideOutRight:
				oldView:
					to: {x: @width}
			slideOutDown:
				oldView:
					to: {y: @height}
			slideOutLeft:
				oldView:
					to: {maxX: 0}

		# shortcuts
		transitions.slideIn = transitions.slideInRight
		transitions.slideOut = transitions.slideOutRight
		transitions.pushIn = transitions.pushInRight
		transitions.pushOut = transitions.pushOutRight

		# events
		Events.ViewWillSwitch = "viewWillSwitch"
		Events.ViewDidSwitch = "viewDidSwitch"
		Layer::onViewWillSwitch = (cb) -> @on(Events.ViewWillSwitch, cb)
		Layer::onViewDidSwitch = (cb) -> @on(Events.ViewDidSwitch, cb)		

		_.each transitions, (animProps, name) =>

			if options.autoLink
				layers = Framer.CurrentContext.getLayers()
				for btn in layers
					if _.contains btn.name, name
						viewController = @
						btn.onClick ->
							anim = @name.split('_')[0]
							linkName = @name.replace(anim+'_','')
							linkName = linkName.replace(/\d+/g, '') # remove numbers
							viewController[anim] _.find(layers, (l) -> l.name is linkName)

			@[name] = (newView, animationOptions = @animationOptions) =>

				return if newView is @currentView

				# make sure the new layer is inside the viewcontroller
				newView.parent = @
				newView.sendToBack()

				# reset props in case they were changed by a prev animation
				newView.point = {x:0, y: 0}
				newView.opacity = 1
				newView.scale = 1
				newView.brightness = 100

				# oldView
				@currentView?.point = {x: 0, y: 0} # fixes offset issue when moving too fast between screens
				@currentView?.props = animProps.oldView?.from
				outgoing = @currentView?.animate _.extend animationOptions, {properties: animProps.oldView?.to}

				# newView
				newView.props = animProps.newView?.from
				incoming = newView.animate _.extend animationOptions, {properties: animProps.newView?.to}
				
				# layer order
				if _.contains name, 'Out'
					newView.placeBehind(@currentView)
					outgoing.on Events.AnimationEnd, => @currentView.bringToFront()
				else
					newView.placeBefore(@currentView)
					
				@emit(Events.ViewWillSwitch, @currentView, newView)
				
				# change CurrentView before animation has finished so one could go back in history
				# without having to wait for the transition to finish
				@saveCurrentViewToHistory name, outgoing, incoming
				@currentView = newView
				@emit("change:previousView", @previousView)
				@emit("change:currentView", @currentView)
				
				incoming.on Events.AnimationEnd, => 
					@emit(Events.ViewDidSwitch, @previousView, @currentView)
				

		if options.initialViewName?
			autoInitial = _.find Framer.CurrentContext.getLayers(), (l) -> l.name is options.initialViewName
			if autoInitial? then @switchInstant autoInitial

		if options.initialView?
			@switchInstant options.initialView

		if options.backButtonName?
			backButtons = _.filter Framer.CurrentContext.getLayers(), (l) -> _.contains l.name, options.backButtonName
			for btn in backButtons
				btn.onClick => @back()

	@define "previousView",
			get: -> @history[0].view

	saveCurrentViewToHistory: (name,outgoingAnimation,incomingAnimation) ->
		@history.unshift
			view: @currentView
			animationName: name
			incomingAnimation: incomingAnimation
			outgoingAnimation: outgoingAnimation

	back: ->
		previous = @history[0]
		if previous.view?

			if _.contains previous.animationName, 'Out'
				previous.view.bringToFront()

			backIn = previous.outgoingAnimation.reverse()
			moveOut = previous.incomingAnimation.reverse()

			backIn.start()
			moveOut.start()

			@currentView = previous.view
			@history.shift()
			moveOut.on Events.AnimationEnd, => @currentView.bringToFront()
