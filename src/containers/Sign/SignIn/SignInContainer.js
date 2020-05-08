import React, { useState } from 'react';
import PropTypes from 'prop-types';
import sha512 from 'js-sha512';
import SecureLS from 'secure-ls';
import { withRouter } from 'react-router-dom';
import InTemplate from 'components/Sign/InTemplate';

const SignInContainer = ({
  signType,
  changeSign,
  idObj,
  pwObj,
  keepLoginObj,
  handleSignIn,
  handleIsSignModal,
  handleResetInputValue,
  getMyInfo,
  modal,
  history
}) => {
  const [isLoading, setIsLoading] = useState(false);

  const requestSignIn = () => {
    const { id } = idObj;
    const { pw } = pwObj;
    const { keepLogin } = keepLoginObj;

    if ((id || pw) === '') {
      modal({
        title: 'Warning!',
        stateType: 'warning',
        contents: 'id 또는 password를 입력해 주세요.'
      });
      
      return;
    }

    const signInObj = {
      id,
      pw: sha512(pw)
    };
    
    setIsLoading(true);

    handleSignIn(signInObj)
      .then(async response => {
        if (response.status === 200) {
          if (keepLogin) {
            localStorage.setItem('soda-token', response.data.token);
            localStorage.setItem('soda-reToken', response.data.refreshToken);
          } else {
            sessionStorage.setItem('soda-token', response.data.token);
            sessionStorage.setItem('soda-reToken', response.data.refreshToken);
          }

          // const ls = new SecureLS({ encodingType: 'aes' }); // user info 저장
          // ls.set('user-info', response.data.member);  // user-info라는 이름으로 저장
          await getMyInfo();
          
          setIsLoading(false);
          handleResetInputValue();

          handleIsSignModal(false);

          history.push('/');
        }
      })
      .catch(error => {
        setIsLoading(false);

        console.log(error);

        const { status } = error.response.data;

        localStorage.removeItem('soda-token');
        localStorage.removeItem('soda-reToken');
        sessionStorage.removeItem('soda-token');
        sessionStorage.removeItem('soda-reToken');
        
        // id 또는 pw가 맞지 않은 경우
        if (status === 403) {
          modal({
            title: 'Error!',
            stateType: 'error',
            contents: 'id 또는 password가 맞지 않습니다.'
          });

          return;
        }

        // 서버 에러
        if (status === 500) {
          modal({
            title: 'Error!',
            stateType: 'error',
            contents: 'Server Error..'
          });

          return;
        }
      });
  };

  return (
    <>
      <InTemplate
        signType={signType}
        changeSign={changeSign}
        idObj={idObj}
        pwObj={pwObj}
        keepLoginObj={keepLoginObj}
        isLoading={isLoading}
        requestSignIn={requestSignIn}
      />
    </>
  );
};

SignInContainer.propTypes = {
  signType: PropTypes.bool,
  changeSign: PropTypes.func,
  idObj: PropTypes.object,
  pwObj: PropTypes.object,
  keepLoginObj: PropTypes.object,
  handleSignIn: PropTypes.func,
  handleIsSignModal: PropTypes.func,
  handleResetInputValue: PropTypes.func,
  getMyInfo: PropTypes.func,
  modal: PropTypes.func,
  history: PropTypes.object
};

export default withRouter(SignInContainer);