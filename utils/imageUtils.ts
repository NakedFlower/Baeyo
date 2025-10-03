export const foodImages = {
  chicken: require('@/assets/images/chicken.png'),
  ddbbii: require('@/assets/images/ddbbii.png'),
  hamburger: require('@/assets/images/hamburger.png'),
  pizza: require('@/assets/images/pizza.png'),
  jogbal: require('@/assets/images/jogbal.png'),
  bossam: require('@/assets/images/bossam.png'),
  baeyo: require('@/assets/images/baeyo.png'),
};

export const getImageByName = (name: string) => {
  return (foodImages as any)[name] || null;
};