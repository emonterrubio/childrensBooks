###################################################################################
# Created by Jordan Robert Dobson on 05 October 2015
# 
# Use to add font files and reference them in your CSS style settings.
#
# To Get Started...
#
# 1. Place the FontFace.coffee file in Framer Studio modules directory
#
# 2. In your project include:
#     {FontFace} = require "FontFace"
#
# 3. To add a font face: 
#     gotham = new FontFace name: "Gotham", file: "Gotham.ttf"
# 
# 4. It checks that the font was loaded. Errors can be suppressed like so...
#    gotham = new FontFace name: "Gotham", file: "Gotham.ttf", hideErrors: true 
#
###################################################################################

class exports.FontFace

	TEST =
		face: "monospace"
		text: "foo"
		time: .01
		maxLoadAttempts: 50
		hideErrorMessages: true
		
	TEST.style = 
		width: "auto"
		fontSize: "150px"
		fontFamily: TEST.face
		
	TEST.layer = new Layer
		name:"FontFace Tester"
		width: 0
		height: 1
		maxX: -(Screen.width)
		visible: false
		html: TEST.text
		style: TEST.style
		
	
	# SETUP FOR EVERY INSTANCE
	constructor: (options) ->
	
		@name = @file = @testLayer = @isLoaded = @loadFailed = @loadAttempts = @originalSize = @hideErrors =  null
		
		if options?
			@name = options.name || null
			@file = options.file || null
		
		return missingArgumentError() unless @name? and @file?
		
		@testLayer         = TEST.layer.copy()
		@testLayer.style   = TEST.style
		@testLayer.maxX    = -(Screen.width)
		@testLayer.visible = true
		
		@isLoaded     = false
		@loadFailed   = false
		@loadAttempts = 0
		@hideErrors   = options.hideErrors

		return addFontFace @name, @file, @
		
	##############################################################################
	# Private Helper Methods #####################################################
		
	addFontFace = (name, file, object) ->
		# Create our Element & Node
		styleTag = document.createElement 'style'
		faceCSS  = document.createTextNode "@font-face { font-family: '#{name}'; src: url('#{file}') format('truetype'); }"
		# Add the Element & Node to the document
		styleTag.appendChild faceCSS
		document.head.appendChild styleTag
		# Test out the Fast to see if it changed
		testNewFace name, object
		
	##############################################################################
		
	removeTestLayer = (object) ->
		object.testLayer.destroy()
		object.testLayer = null
		
	##############################################################################
		
	testNewFace = (name, object) ->
		
		initialWidth = object.testLayer._element.getBoundingClientRect().width
		
		# Check to see if it's ready yet
		if initialWidth is 0
			if object.hideErrors is false or TEST.hideErrorMessages is false
				print "Load testing failed. Attempting again."
			return Utils.delay TEST.time, -> testNewFace name, object
		
		object.loadAttempts++
		
		if object.originalSize is null
			object.originalSize = initialWidth
			object.testLayer.style = fontFamily: "#{name}, #{TEST.face}"
		
		widthUpdate = object.testLayer._element.getBoundingClientRect().width

		if object.originalSize is widthUpdate
			# If we can attempt to check again... Do it
			if object.loadAttempts < TEST.maxLoadAttempts
				return Utils.delay TEST.time, -> testNewFace name, object
				
			print "⚠️ Failed loading FontFace: #{name}" unless object.hideErrors
			object.isLoaded   = false
			object.loadFailed = true
			loadTestingFileError object unless object.hideErrors
			return
			
		else
			print "LOADED: #{name}" unless object.hideErrors is false or TEST.hideErrorMessages
			object.isLoaded   = true
			object.loadFailed = false

		removeTestLayer object
		return name

	##############################################################################
	# Error Handler Methods ######################################################

	missingArgumentError = ->
		error null
		console.error """
			Error: You must pass name & file properites when creating a new FontFace. \n
			Example: myFace = new FontFace name:\"Gotham\", file:\"gotham.ttf\" \n"""
			
	loadTestingFileError = (object) ->
		error null
		console.error """
			Error: Couldn't detect the font: \"#{object.name}\" and file: \"#{object.file}\" was loaded.  \n
			Either the file couldn't be found or your browser doesn't support the file type that was provided. \n
			Suppress this message by adding \"hideErrors: true\" when creating a new FontFace. \n"""
