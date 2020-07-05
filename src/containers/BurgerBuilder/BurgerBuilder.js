import React, { useState, useEffect, useCallback } from 'react';
import { useDispatch, useSelector } from 'react-redux';

import Auxx from '../../hoc/Auxx/Auxx';
import Burger from '../../components/Burger/Burger';
import BuildControls from '../../components/Burger/BuildControls/BuildControls';
import Modal from '../../components/UI/Modal/Modal';
import OrderSummary from '../../components/Burger/OrderSummary/OrderSummary';
import Spinner from '../../components/UI/Spinner/Spinner';
import withErrorHandler from '../../hoc/withErrorHandler/withErrorHandler';
import axios from "../../axios-orders";

import * as actions from '../../store/actions';

const BurgerBuilder = props => {
  const [purchasing, setPurchasing] = useState(false);

  const dispatch = useDispatch();

  const ings = useSelector(state => {
    return state.burgerBuilder.ingredients;
  });
  const price = useSelector(state => state.burgerBuilder.totalPrice);
  const error = useSelector(state => state.burgerBuilder.error);
  const isAuthenticated = useSelector(state => state.auth.token !== null);

  const onIngredientAdded = (ingName) => dispatch(actions.addIngredient(ingName));
  const onIngredientRemoved = (ingName) => dispatch(actions.removeIngredient(ingName));
  const onInitIngredients = useCallback(
    () => dispatch(actions.initIngredients()),
    [dispatch]
  );
  const onInitPurchase = () => dispatch(actions.purchaseInit());
  const onSetAuthRedirectPath = (path) => dispatch(actions.setAuthRedirectPath(path));

  useEffect(() => {
    onInitIngredients();
  }, [onInitIngredients]);

  const updatePurchaseState = ingredients => {
    const sum = Object.keys(ingredients)
      .map(igKey => {
        return ingredients[igKey];
      })
      .reduce((sum, el) => {
        return sum + el;
      }, 0);
    return sum > 0;
  };

  const handlePurchase = () => {
    if (isAuthenticated) {
      setPurchasing(true);
    } else {
      onSetAuthRedirectPath('/checkout');
      props.history.push('/auth');
    }
  };

  const handlePurchaseCancel = () => {
    setPurchasing(false);
  }

  const handlePurchaseContinue = () => {
    onInitPurchase();
    props.history.push('/checkout');
  }

  const disabledInfo = { ...ings };
  for (let key in disabledInfo) {
    disabledInfo[key] = disabledInfo[key] <= 0;
  }
  let orderSummary = null;
  let burger = error ? <p>Ingredients can't be loaded!</p> : <Spinner />;
  if (ings) {
    burger = (
      <Auxx>
        <Burger ingredients={ings} />
        <BuildControls
          onRemoveIngredient={onIngredientRemoved}
          onAddIngredient={onIngredientAdded}
          disabled={disabledInfo}
          purchasable={updatePurchaseState(ings)}
          ordered={handlePurchase}
          isAuth={isAuthenticated}
          price={price}
        />
      </Auxx>
    );

    orderSummary = (
      <OrderSummary
        ingredients={ings}
        price={price}
        purchaseCancelled={handlePurchaseCancel}
        purchaseContinued={handlePurchaseContinue}
      />
    );
  }
  
  return (
    <Auxx>
      <Modal
        show={purchasing}
        modalClose={handlePurchaseCancel}
      >
        {orderSummary}
      </Modal>
      {burger}
    </Auxx>
  );
}

export default withErrorHandler( BurgerBuilder, axios );
