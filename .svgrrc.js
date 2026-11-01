// react-native-svg-transformer 기본 svgo 설정 + prefixIds.
// 기본 설정은 SVG 안의 id(clipPath 등)를 모두 'a' 같은 짧은 이름으로 바꾸는데,
// 웹에서는 한 페이지의 여러 SVG 가 같은 id 를 공유해 다른 아이콘의 clipPath 로 잘리는 문제가 생긴다.
// 파일명 기반 접두어를 붙여 id 가 겹치지 않게 한다.
module.exports = {
  svgoConfig: {
    plugins: [
      {
        name: 'preset-default',
        params: {
          overrides: {
            inlineStyles: { onlyMatchedOnce: false },
            removeViewBox: false,
            removeUnknownsAndDefaults: false,
            convertColors: false,
          },
        },
      },
      'prefixIds',
    ],
  },
};
