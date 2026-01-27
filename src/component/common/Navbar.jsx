import { useEffect, useState } from "react"
import { AiOutlineMenu, AiOutlineShoppingCart } from "react-icons/ai"
import { BsChevronDown } from "react-icons/bs"
import { useSelector } from "react-redux"
import { Link, matchPath, useLocation } from "react-router-dom"

import logo from "../../assets/Logo/Logo-Full-Light.png"
import { NavbarLinks } from "../../data/navbar-links"
import { apiConnector } from "../../services/apiconnector"
import { categories } from "../../services/api"
import { ACCOUNT_TYPE } from "../../utils/constants"
import ProfileDropDown from "../core/Auth/ProfileDropDown"

const Navbar = () => {
  const { token } = useSelector((state) => state.auth)
  const { user } = useSelector((state) => state.profile)
  const { totalItems } = useSelector((state) => state.cart)
  const location = useLocation()

  const [subLinks, setSubLinks] = useState([])
  const [loading, setLoading] = useState(false)
  const [openMenu, setOpenMenu] = useState(false)
  const [openCatalog, setOpenCatalog] = useState(false)


  useEffect(() => {
    ;(async () => {
      setLoading(true)
      try {
        const res = await apiConnector("GET", categories.CATEGORIES_API)
        setSubLinks(res.data.data)
      } catch (error) {
        console.log("Could not fetch Categories.", error)
      }
      setLoading(false)
    })()
  }, [])

  const matchRoute = (route) => {
    return matchPath({ path: route }, location.pathname)
  }

  return (
    <div
      className={`relative flex h-[72px] items-center justify-center border-b border-richblack-700
      ${location.pathname !== "/" ? "bg-richblack-800" : "bg-richblack-900"}`}
    >
      <div className="flex w-11/12 max-w-maxContent items-center justify-between">

        {/* Logo */}
        <Link to="/">
          <img
            src={logo}
            alt="StudyAdda"
            className="h-25 w-auto"
            loading="lazy"
          />
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:block">
          <ul className="flex items-center gap-x-6 text-sm font-medium text-richblack-25">
            {NavbarLinks.map((link, index) => (
              <li key={index}>
                {link.title === "Catalog" ? (
                  <div className="relative flex items-center gap-1 cursor-pointer group">
                    <span
                      className={
                        matchRoute("/catalog/:catalogName")
                          ? "text-yellow-300"
                          : ""
                      }
                    >
                      Catalog
                    </span>
                    <BsChevronDown />

                    {/* Dropdown */}
                    <div className="invisible absolute top-full left-1/2 z-[1000]
                      w-64 -translate-x-1/2 translate-y-4 rounded-lg bg-richblack-5
                      p-4 text-richblack-900 opacity-0 shadow-xl
                      transition-all duration-200 group-hover:visible
                      group-hover:translate-y-2 group-hover:opacity-100"
                    >
                      <div className="absolute left-1/2 top-0 h-4 w-4 -translate-x-1/2
                        -translate-y-1/2 rotate-45 bg-richblack-5"
                      />

                      {loading ? (
                        <p className="text-center text-sm">Loading...</p>
                      ) : subLinks?.length > 0 ? (
                        subLinks
                          .filter((s) => s?.courses?.length > 0)
                          .map((subLink, i) => (
                            <Link
                              key={i}
                              to={`/catalog/${subLink.name
                                .split(" ")
                                .join("-")
                                .toLowerCase()}`}
                              className="block rounded-md px-3 py-2 text-sm hover:bg-richblack-50"
                            >
                              {subLink.name}
                            </Link>
                          ))
                      ) : (
                        <p className="text-center text-sm">No Courses Found</p>
                      )}
                    </div>
                  </div>
                ) : (
                  <Link
                    to={link.path}
                    className={`${
                      matchRoute(link.path)
                        ? "text-yellow-300"
                        : "text-richblack-25"
                    } hover:text-yellow-200`}
                  >
                    {link.title}
                  </Link>
                )}
              </li>
            ))}
          </ul>
        </nav>

        {/* Desktop Right */}
        <div className="hidden md:flex items-center gap-x-4">
          {user && user.accountType !== ACCOUNT_TYPE.INSTRUCTOR && (
            <Link to="/dashboard/cart" className="relative">
              <AiOutlineShoppingCart className="text-2xl text-richblack-100" />
              {totalItems > 0 && (
                <span className="absolute -top-2 -right-2 grid h-5 w-5 place-items-center
                rounded-full bg-yellow-300 text-xs font-bold text-richblack-900">
                  {totalItems}
                </span>
              )}
            </Link>
          )}

          {!token && (
            <>
              <Link to="/login">
                <button className="rounded-md border border-richblack-700 bg-richblack-800 px-4 py-2 text-sm text-richblack-100">
                  Log in
                </button>
              </Link>
              <Link to="/signup">
                <button className="rounded-md border border-richblack-700 bg-richblack-800 px-4 py-2 text-sm text-richblack-100">
                  Sign Up
                </button>
              </Link>
            </>
          )}

          {token && <ProfileDropDown />}
        </div>

        {/* Mobile Menu Button */}
        <button
          onClick={() => setOpenMenu(!openMenu)}
          className="md:hidden"
        >
          <AiOutlineMenu className="text-2xl text-richblack-100" />
        </button>
      </div>

      {/* Mobile Menu Panel */}
      {openMenu && (
  <div className="absolute top-[72px] left-0 z-[999]
  w-full bg-richblack-800 border-t border-richblack-700 md:hidden">

    <ul className="flex flex-col gap-4 p-6 text-richblack-25">

      {NavbarLinks.map((link, index) => (
        <li key={index}>
          {link.title === "Catalog" ? (
            <>
              {/* Catalog Button */}
              <button
                onClick={() => setOpenCatalog((prev) => !prev)}
                className="flex w-full items-center justify-between text-sm hover:text-yellow-300"
              >
                <span>Catalog</span>
                <BsChevronDown
                  className={`transition ${
                    openCatalog ? "rotate-180" : ""
                  }`}
                />
              </button>

              {/* Mobile Catalog Dropdown */}
              {openCatalog && (
                <div className="mt-3 ml-4 flex flex-col gap-2">
                  {loading ? (
                    <p className="text-xs text-richblack-300">Loading...</p>
                  ) : subLinks?.length > 0 ? (
                    subLinks
                      .filter((c) => c?.courses?.length > 0)
                      .map((category, i) => (
                        <Link
                          key={i}
                          to={`/catalog/${category.name
                            .split(" ")
                            .join("-")
                            .toLowerCase()}`}
                          onClick={() => {
                            setOpenMenu(false)
                            setOpenCatalog(false)
                          }}
                          className="text-sm text-richblack-200 hover:text-yellow-300"
                        >
                          {category.name}
                        </Link>
                      ))
                  ) : (
                    <p className="text-xs text-richblack-300">
                      No Courses Found
                    </p>
                  )}
                </div>
              )}
            </>
          ) : (
            <Link
              to={link.path}
              onClick={() => setOpenMenu(false)}
              className="block text-sm hover:text-yellow-300"
            >
              {link.title}
            </Link>
          )}
        </li>
      ))}

      {!token && (
        <>
          <Link to="/login" onClick={() => setOpenMenu(false)}>
            Log in
          </Link>
          <Link to="/signup" onClick={() => setOpenMenu(false)}>
            Sign Up
          </Link>
        </>
      )}
    </ul>
  </div>
)}

    </div>
  )
}

export default Navbar
