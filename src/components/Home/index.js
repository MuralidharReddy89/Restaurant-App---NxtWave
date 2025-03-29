import {useState, useEffect, useCallback} from 'react'
import Header from '../Header'
import DishItem from '../DishItem'
import './index.css'

const Home = () => {
  const [isLoading, setIsLoading] = useState(true)
  const [response, setResponse] = useState([])
  const [activeCategoryId, setActiveCategoryId] = useState('')
  const [cartItems, setCartItems] = useState([])

  const addItemToCart = dish => {
    setCartItems(prev => {
      const existingItem = prev.find(item => item.dishId === dish.dishId)
      return existingItem
        ? prev.map(item =>
            item.dishId === dish.dishId
              ? {...item, quantity: item.quantity + 1}
              : item,
          )
        : [...prev, {...dish, quantity: 1}]
    })
  }

  const removeItemFromCart = dish => {
    setCartItems(prev =>
      prev
        .map(item =>
          item.dishId === dish.dishId
            ? {...item, quantity: item.quantity - 1}
            : item,
        )
        .filter(item => item.quantity > 0),
    )
  }

  const getUpdatedData = tableMenuList =>
    tableMenuList.map(eachMenu => ({
      menuCategory: eachMenu.menu_category,
      menuCategoryId: eachMenu.menu_category_id,
      menuCategoryImage: eachMenu.menu_category_image,
      categoryDishes: eachMenu.category_dishes.map(eachDish => ({
        dishId: eachDish.dish_id,
        dishName: eachDish.dish_name,
        dishPrice: eachDish.dish_price,
        dishImage: eachDish.dish_image,
        dishCurrency: eachDish.dish_currency,
        dishCalories: eachDish.dish_calories,
        dishDescription: eachDish.dish_description,
        dishAvailability: eachDish.dish_Availability,
        dishType: eachDish.dish_Type,
        addonCat: eachDish.addonCat,
      })),
    }))

  const fetchRestaurantApi = useCallback(async () => {
    const api =
      'https://apis2.ccbp.in/restaurant-app/restaurant-menu-list-details'

    try {
      const apiResponse = await fetch(api)
      if (!apiResponse.ok) {
        throw new Error('Failed to fetch data')
      }

      const data = await apiResponse.json()
      console.log('API Response:', data)

      if (data?.[0]?.table_menu_list?.length > 0) {
        const updatedData = getUpdatedData(data[0].table_menu_list)
        setResponse(updatedData)
        setActiveCategoryId(updatedData[0]?.menuCategoryId || '')
      } else {
        console.error('Invalid API response structure')
      }
    } catch (error) {
      console.error('API fetch error:', error)
    } finally {
      setIsLoading(false)
    }
  }, [])

  useEffect(() => {
    fetchRestaurantApi()
  }, [fetchRestaurantApi]) // ✅ Fixed react-hooks/exhaustive-deps warning

  const onUpdateActiveCategoryIdx = menuCategoryId =>
    setActiveCategoryId(menuCategoryId)

  const renderTabMenuList = () =>
    response.length > 0 ? (
      response.map(eachCategory => (
        <li
          className={`each-tab-item ${
            eachCategory.menuCategoryId === activeCategoryId
              ? 'active-tab-item'
              : ''
          }`}
          key={eachCategory.menuCategoryId}
          onClick={() => onUpdateActiveCategoryIdx(eachCategory.menuCategoryId)}
          data-testid={`tab-${eachCategory.menuCategoryId}`}
        >
          <button
            type="button"
            className="mt-0 mb-0 ms-2 me-2 tab-category-button"
          >
            <span>{eachCategory.menuCategory}</span>
          </button>
        </li>
      ))
    ) : (
      <p>No categories found</p>
    )

  const renderDishes = () => {
    const activeCategory = response.find(
      eachCategory => eachCategory.menuCategoryId === activeCategoryId,
    )

    return activeCategory ? (
      <ul className="m-0 d-flex flex-column dishes-list-container">
        {activeCategory.categoryDishes.map(eachDish => (
          <DishItem
            key={eachDish.dishId}
            dishDetails={eachDish}
            cartItems={cartItems}
            addItemToCart={addItemToCart}
            removeItemFromCart={removeItemFromCart}
          />
        ))}
      </ul>
    ) : (
      <p>No dishes available</p>
    )
  }

  const renderSpinner = () => (
    <div className="spinner-container">
      <div className="spinner-border" role="status" />
    </div>
  )

  return isLoading ? (
    renderSpinner()
  ) : (
    <div className="home-background">
      <Header cartItems={cartItems} />
      <ul className="m-0 ps-0 d-flex tab-container">{renderTabMenuList()}</ul>
      {renderDishes()}
    </div>
  )
}

export default Home
