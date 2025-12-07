function App() {

  return (
    <>
      <div className="min-h-screen bg-richblack-900">
      {/* Using custom fonts */}
      <h1 className="font-inter text-4xl text-caribbeangreen-100">
        Heading with Inter Font
      </h1>
      
      <h2 className="font-edu-sa text-3xl text-yellow-50">
        Cursive Font Heading
      </h2>
      
      <code className="font-mono text-pink-200">
        const code = "with Roboto Mono";
      </code>

      {/* Using custom colors */}
      <div className="bg-richblue-400 text-white p-6">
        Rich Blue Background
      </div>

      <button className="bg-caribbeangreen-200 text-richblack-900 px-6 py-3 rounded">
        Caribbean Green Button
      </button>

      {/* Using custom max-width */}
      <div className="max-w-(--width-maxContent) mx-auto">
        Content with custom max width
      </div>

      <div className="max-w-(--width-maxContentTab) mx-auto">
        Tablet content width
      </div>
    </div>


    </>
  )
}

export default App
