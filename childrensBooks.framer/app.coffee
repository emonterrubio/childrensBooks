# Defaults
background = new BackgroundLayer
	backgroundColor: "white"
	
#–––––––––––––––––––––––––––#
#          COLORS           #
#–––––––––––––––––––––––––––#
Primary = "#00607F"
Secondary = "#96B7C2"
Selection = "#1F506B"
Text = "#4A4A4A"
LightGrey = "#F6F7F9"

#––––––––––––––––––––––––––#
#          FONTS           #
#––––––––––––––––––––––––––#
Utils.insertCSS('@import url(http://fonts.googleapis.com/css?family=Roboto);')

#––––––––––––––––––––––––––#
#          STYLES          #
#––––––––––––––––––––––––––#
Utils.insertCSS ("
	.title {color: #4B4F56; font-size: 28px; font-weight: 500;}
	.bookTitle {color: #4B4F56; font-size: 40px; font-weight: 400; line-height: 40px;}
	.subtitle {color: #4B4F56; font-size: 30px; font-weight: 300;}
	.header {color: #4B4F56; font-size: 36px; font-weight: 300;}
	.text {color: #4B4F56; font-size: 28px; font-weight: 400; line-height: 32px;}
	.stars {color: #00607F;}
	.bookDescription {padding-left: 40px; padding-right: 40px;}
	.lineAdjust05 {height: 5px;}
	.lineAdjust10 {height: 10px;}
	.lineAdjust15 {height: 15px;}
	.lineAdjust20 {height: 20px;}
	.lineAdjust30 {height: 30px;}
	.lineAdjust40 {height: 40px;}
	.line {border-bottom: 1px solid #ccc;}
	.bookInformation {position:relative;}
	.amazon {font-family: Roboto; font-size: 28px; text-align: center; border-color: #00607F; border-radius: 4px; padding: 10px; display: block; position: absolute; right: 0; top: 0; color: #00607F; border: 2px solid #00607F;}
")

#––––––––––––––––––––––––––––––––––#
#      IMPORT DATA FIREBASE        #
#––––––––––––––––––––––––––––––––––#
{Firebase} = require 'firebase'

firebase = new Firebase
    projectID: "libraryapp-a5864"
    secret: "WxkhqECMn8Fk58PsnT5Hm5IbNNkVvBbtu6MV7fgh"
    server: "s-usc1c-nss-122.firebaseio.com"

#––––––––––––––––––––––––––––––––––––#
#         ANIMATION CURVES           #
#––––––––––––––––––––––––––––––––––––#
animateIn = "spring(450,40,0)"
animateOut = "spring(550,45,0)"

#–––––––––––––––––––––––––––––––––––#
#        SUB NAVIGATION TABS        #
#–––––––––––––––––––––––––––––––––––#
subNavTabs = new Layer
	width: Screen.width, height: 100, y: 0
	backgroundColor: LightGrey
	visible: false
# 	superLayer: bookDetailsScroll.content

detailsTab = new Layer
	width: 250, height: 94, x: 0
	backgroundColor: "transparent"
	html: "Details"
	superLayer: subNavTabs
detailsTab.style = color: Primary, textAlign: "center", paddingTop: "36px", fontSize: "32px", fontWeight: "500", fontFamily: 'Roboto'

myNotesTab = new Layer
	width: 250, height: 94, x: 250
	backgroundColor: "transparent"
	html: "My Notes"
	superLayer: subNavTabs
myNotesTab.style = color: Primary, textAlign: "center", paddingTop: "36px", fontSize: "32px", fontWeight: "400", fontFamily: 'Roboto'

similarTab = new Layer
	width: 250, height: 94, x: 500
	backgroundColor: "transparent"
	html: "Similar"
	superLayer: subNavTabs
similarTab.style = color: Primary, textAlign: "center", paddingTop: "36px", fontSize: "32px", fontWeight: "400", fontFamily: 'Roboto'
	
tabsHairline = new Layer
	width: 250, height: 6, y: 94
	backgroundColor: Primary
	superLayer: subNavTabs

#––––––––––––––––––––––––––––––––––––#
#          MY BOOKS SCREEN           #
#––––––––––––––––––––––––––––––––––––#
navBar = new Layer
	width: Screen.width, height: 130
	backgroundColor: Primary
	shadowY: 1
	shadowBlur: 1
	shadowColor: "rgba(0,0,0,0.2)"
	
statusBarWhite = new Layer
	width: 725, height: 18, x: 15, y: 8
	image: "images/statusBarWhite.svg"
	superLayer: navBar
	
navBarTitle = new Layer
	width: Screen.width, height: 40, y: navBar.height/2 - 3
	backgroundColor: "transparent"
	html: "My Books"
	superLayer: navBar
navBarTitle.style = fontSize: "40px", fontWeight: "400", textAlign: "center", fontFamily: "Roboto"

sortIcon = new Layer
	width: 40, height: 36, y: navBar.height/2 - 3, x: 30
	image: "images/sortIcon.svg"
	superLayer: navBar

searchIcon = new Layer
	width: 40, height: 40, y: navBar.height/2 - 3, x: 680
	image: "images/searchIcon.svg"
	superLayer: navBar
	
moreIcon = new Layer
	width: 44, height: 12, y: 73, x: 590
	image: "images/moreIcon.svg"
	superLayer: navBar
	
starIcon = new Layer
	width: 46, height: 44, y: navBar.height/2 - 10, x: 680
	image: "images/starIcon.svg"
	visible: false
	superLayer: navBar
	
backArrow = new Layer
	width: 18, height: 36, x: 30, y: navBar.height/2 - 6
	image: "images/backArrow.svg"
	visible: false
	superLayer: navBar

#––––––––––––––––––––––––––––––––––––#
#         SCREEN SCROLLERS           #
#––––––––––––––––––––––––––––––––––––#	
bookListScroll = new ScrollComponent
	width: Screen.width, height: Screen.height, y: navBar.maxY
	backgroundColor: "white"
	visible: true
bookListScroll.scrollHorizontal = false
bookListScroll.contentInset = bottom: 220

bookDetailsScroll = new ScrollComponent
	width: Screen.width, height: Screen.height + 200, y: navBar.maxY + 100, x: -750
	backgroundColor: "white"
	visible: false
bookDetailsScroll.scrollHorizontal = false
bookDetailsScroll.contentInset = bottom: 400

bookMyNotesScroll = new ScrollComponent
	width: Screen.width, height: Screen.height, y: navBar.maxY + 100, x: -750
	backgroundColor: "white"
	visible: false
bookMyNotesScroll.scrollHorizontal = false
bookMyNotesScroll.contentInset = bottom: 300

#–––––––––––––––––––––––––––––––––––#
#            ACTIONS BAR            #
#–––––––––––––––––––––––––––––––––––#
actionBar = new Layer
	width: Screen.width, height: 90, y: 1344
	backgroundColor: LightGrey
	visible: false
	
shareIcon = new Layer
	width: 38, height: 33, x: 40, y: 28
	image: "images/shareIcon.svg"
	superLayer: actionBar
	
favoriteIconDefault = new Layer
	width: 40, height: 36, x: 350, y: 28
	image: "images/favoriteIconDefault.svg"
	superLayer: actionBar
	
favoriteIcon = new Layer
	width: 40, height: 36, x: 350, y: 28
	image: "images/favoriteIcon.svg"
	superLayer: actionBar
	visible: false
	
writeIcon = new Layer
	width: 39, height: 39, x: 680, y: 28
	image: "images/writeIcon.svg"
	superLayer: actionBar

#––––––––––––––––––––––––––––––––––––#
#         BOOK LIST SCREEN           #
#––––––––––––––––––––––––––––––––––––#
# retrieves one book based on index
# firebase.get "/0/book", (results) ->
# 	print results

# retrieves books by key and limits to x number
# firebase.get "/results", (response, {orderBy: "$key", limitToFirst: 5})

# retrieves all books
response = (results) ->
	booksArray = _.toArray(results)
	
	bookCounterBar = new Layer
		width: Screen.width, height: 90, y: 1244
		backgroundColor: LightGrey
		html: results.length + " books"
	bookCounterBar.style = color: Text, textAlign: "center", paddingTop: "30px", fontSize: "32px", fontWeight: "400"
	
	# print result for key, result of results
	for result, i in booksArray
		booksArray[i] = new Layer
			width: Screen.width, height: 140, y: 141 * i
			backgroundColor: "white"
			superLayer: bookListScroll.content
			shadowY: 1
			shadowBlur: 1
			shadowColor: "rgba(0,0,0,0.2)"
		booksArray[i].style = fontFamily: 'Roboto'

		booksArray[i].amazon = result.amazon
		booksArray[i].author = result.author
		booksArray[i].book = result.book
		booksArray[i].category = result.category
		booksArray[i].checkedOut = result.checkedOut
		booksArray[i].cover = result.cover
		booksArray[i].description = result.description
		booksArray[i].illustrator = result.illustrator
		booksArray[i].rating = result.rating
		booksArray[i].subtitle = result.subtitle
		booksArray[i].tags = result.tags
		booksArray[i].timesRead = result.timesRead
		booksArray[i].year = result.year

		# number of books in database
		# print results.length
	
		#–––––––––––––––––––––––––––#
		#         RATINGS           #
		#–––––––––––––––––––––––––––#
		if result.rating == "Did not read"
			result.rating = "Not yet rated"
		else if result.rating == "Did not like"
			result.rating = "★"
		else if result.rating == "Liked it"
			result.rating = "★★"
		else if result.rating == "Loved it"
			result.rating = "★★★"
			
# 		Truncate title when it's too long
		if result.book.length > 32
			result.book = result.book.substring(0, 32) + "..."
			
		bookCover = new Layer
			width: 140, height: booksArray[i].height
			backgroundColor: "transparent"
			image: result.cover
			superLayer: booksArray[i]
			
		bookTitle = new Layer
			width: 600, height: 40, x: bookCover.width + 20, y: 22
			backgroundColor: "transparent"
			html: result.book
			superLayer: booksArray[i]
		bookTitle.style = color: Text, fontSize: "32px", fontWeight: "500"
		
		bookAuthor = new Layer
			width: 600, height: 40, x: bookCover.width + 20, y: 60
			backgroundColor: ""
			html: result.author + "," + " " + " " + " " + result.illustrator
			superLayer: booksArray[i]
		bookAuthor.style = color: Text, fontSize: "28px", fontWeight: "400"
		
		if result.illustrator == result.author
			bookAuthor.html = result.author
		
		starRating = new Layer
			width: 300, height: 30, x: bookCover.width + 20, y: 95
			html: result.rating
			backgroundColor: "transparent"
			superLayer: booksArray[i]
		starRating.style = color: Primary
		
# 		this places the current book title on the navbar
		bookTitleDetails = new Layer
			width: 560, height: 40, y: navBar.height/2 - 3
			backgroundColor: "transparent"
			html: result.title
			superLayer: navBar
			visible: false
		bookTitleDetails.style = textAlign: "center", fontSize: "36px"
		bookTitleDetails.centerX()
		
		#–––––––––––––––––––––––––––––––#
		#     BOOK BUTTON FROM LIST     #
		#–––––––––––––––––––––––––––––––#
		scrolling = false
		booksArray[i].on Events.TouchStart, (event, layer) ->
			scrolling = false
		booksArray[i].on Events.TouchMove, (event, layer) ->
			scrolling = true
		booksArray[i].on Events.TouchEnd, (event, layer) ->
			if scrolling
				return false
			sortIcon.visible = false
			moreIcon.visible = false
			searchIcon.visible = false
			navBarTitle.visible = false
			backArrow.visible = true
			starIcon.visible = true
			bookTitleDetails.visible = true
			bookDetailsScroll.visible = true
			subNavTabs.visible = true
			actionBar.visible = true
			
			# Truncate title when it's too long
			if layer.book.length > 32
				bookTitleDetails.html = layer.book.substring(0, 30) + "..."
			
			bookListScroll.animate
				properties: x: 750
				curve: animateOut
			bookDetailsScroll.animate
				properties: x: 0
				curve: animateIn
			subNavTabs.animate
				properties: y: 130
				curve: animateIn
			bookCounterBar.animate
				properties: y: 1334
				curve: animateOut
			actionBar.animate
				properties: y: 1244
				curve: animateIn
			Utils.delay .5, ->
				bookListScroll.visible = false
				bookCounterBar.visible = false
				
			#––––––––––––––––––––––––––––––––––#
			#       BOOK DETAILS SCROLL        #
			#––––––––––––––––––––––––––––––––––#
			bookCoverDetails = new Layer
				width: Screen.width, height: 410
				backgroundColor: "transparent"
				image: layer.cover
				superLayer: bookDetailsScroll.content
				
			#––––––––––––––––––––––––––#
			#        RATINGS           #
			#––––––––––––––––––––––––––#
			if layer.rating == "Did not read"
				layer.rating = "Not yet rated"
			else if layer.rating == "Did not like"
				layer.rating = "★"
			else if layer.rating == "Liked it"
				layer.rating = "★★"
			else if layer.rating == "Loved it"
				layer.rating = "★★★"
					
			bookDescription = new Layer
				width: Screen.width, y: bookCoverDetails.maxY + 30
				backgroundColor: "transparent"
				superLayer: bookDetailsScroll.content
			bookDescription.style = fontFamily: 'Roboto'
			bookDescription.html =
				'<div class = "bookDescription">
					<p class = "bookTitle">' + layer.book + '</p>
					<p class = "lineAdjust15"></p>
					<p class = "subtitle">' + layer.author + '</p>
					<p class = "lineAdjust40"></p>
					<p class = "header">Book Description</p>
					<p class = "lineAdjust30"></p>
					<p class = "text">' + layer.description + '</p>
					<p class = "lineAdjust40"></p>
					<p class = "line"></p>
					<p class = "lineAdjust40"></p>
					<div class = "bookInformation">
						<span class = "amazon">Amazon</span>
						<p class = "header">Information</p>
						<p class = "lineAdjust30"></p>
						<p class = "text">Illustrator: <span class = "title">' + layer.illustrator + '</span></p>
						<p class = "lineAdjust10"></p>
						<p class = "text">Category: <span class = "title">' + layer.category + '</span></p>
						<p class = "lineAdjust10"></p>
						<p class = "text">Year: <span class = "title">' + layer.year + '</p>
						<p class = "lineAdjust10"></p>
						<p class = "text">My Rating: <span class = "stars">' + layer.rating + '</span></p>
						<p class = "lineAdjust10"></p>
						<p class = "text">Tags: <span class = "title">' + layer.tags + '</p>
						<p class = "lineAdjust10"></p>
						<p class = "text">Amazon Rating: <span class = "title">' + layer.amazon + '</p>
						<p class = "lineAdjust10"></p>
						<p class = "text">Last Checked Out: <span class = "title">' + layer.checkedOut + '</p>
					</div>
				</div>'
			#–––––––––––––––––––––––––––––––––#
			#          BACK BUTTON            #
			#–––––––––––––––––––––––––––––––––#
			backArrow.on Events.TouchEnd, ->
				navBarTitle.visible = true
				bookTitleDetails.visible = false
				bookDetailsScroll.animate
					properties: x: -750
					curve: animateOut
				Utils.delay .5, ->
					bookDetailsScroll.visible = false
	# 				bookIndexDetails.html = ""
					bookDescription.html = ""
					bookTitleDetails.html = ""
					subNavTabs.visible = false
				bookListScroll.visible = true
				bookCounterBar.visible = true
				bookListScroll.animate
					properties: x: 0
					curve: animateIn
				bookCounterBar.animate
					properties: y: 1244
					curve: animateIn
				subNavTabs.animate
					properties: y: 0
					curve: animateIn

# retrives only a limited amount of books
firebase.get("/results",response,{orderBy: "$key"})
