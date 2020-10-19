import React, { useEffect, useRef, useState } from 'react';
import isEmail from 'isemail';
import Loader from './Loader';

function App() {

  const initial = {
    email: '',
    fullname: '',
    phone: '',
    address: '',
    audience: '',
    tag: '',
    organization: ''
  };

  const [ state, setState ] = useState(initial);
  const [ audiences, setAudiences] = useState(null);
  const [ tags, setTags ] = useState(null);
  const [ tagsToShow, setTagsToShow ] = useState(null);
  const [ errors, setErrors ] = useState(initial);
  const [ isLoading, setLoading ] = useState(false);
  const [ selectedTags, setSelectedTags ] = useState([]);
  const [ error, setError ] = useState('');

  const onChange = (field) => (e) => {
    e.persist();
    setState((state) => ({
      ...state,
      [field]: e.target.value
    }));

    if (e.target.value === '') {
      setErrors((state) => ({
        ...state,
        [field]: 'Поле не должно быть пустым!'
      }));
    } else if (field === 'email') { 
      if (!isEmail.validate(e.target.value)) {
        setErrors((state) => ({
          ...state,
          [field]: 'Введите правильный email'
        }));  
      } else {
        setErrors((state) => ({
          ...state,
          [field]: ''
        }));  
      }

    } else if(field === 'tag') {
      const name = (tags.find((tag) => tag.id === e.target.value)).name;

      setSelectedTags((tags) => ([
        ...tags,
        name
      ]));

      setTagsToShow(tagsToShow.filter((item) => item.id !== e.target.value));
    
    } else {
      setErrors((state) => ({
        ...state,
        [field]: ''
      }));
    }
  };

  const submit = (e) => {
    e.preventDefault();
    const bodyToSend = {
      audience: state.audience,
      tags: selectedTags,
      contact: {
          email: state.email,
          organization: state.organization,
          fullname: state.fullname,
          address: state.address,
          phone: state.phone
      }
    }
    fetch('http://localhost:4000/addContact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(bodyToSend)
    }).then((resp) => {
      if (resp.ok) {
        window.location.reload()
      } else {
        setError('Такой email уже существует!');
      }
    }).catch((e) => console.log(e));
  };

  useEffect(() => {
    const fetchAudiences = async () => {
      setLoading(true);
      const resp = await fetch('http://localhost:4000/audiences');
      const body = await resp.json();
      setAudiences(body);
      setState((state) => ({
        ...state,
        audience: body[0].id
      }));
      setLoading(false);
    };
    fetchAudiences();
  }, []);

  useEffect(() => {
    if (state.audience === '') return;
    const fetchTags = async () => {
      setLoading(true);
      const resp = await fetch(`http://localhost:4000/audiences/${state.audience}/tags`);
      const body = await resp.json();
      setTags(body);
      setTagsToShow(body);
      setLoading(false);
    };
    fetchTags();
  }, [ state.audience ]);


  return (
    <div className="App">
      <div className="container">
        <h1>РЕГИСТРАЦИОННАЯ ФОРМА ДЛЯ РАССЫЛКИ НОВОСТЕЙ И ПРАЙСОВ</h1>
        <div className="form-container">
          <form onSubmit={submit}>
            <p>
                Уважаемые Партнеры,<br />
                убедительно просим Вас внимательно отнестись к заполнению этой формы.<br />
                От этого будет зависеть оперативность, качество и своевременность 
                информирования Вас о всех новинках и прайс-листах нашей компании.<br />
                Благодарим Вас!
            </p>
            <p style={{'color': 'red'}}>{error}</p>
            <div className="fields">
              <div className="form-contol">
                <label>Email</label>
                <input type="email" required value={state.email} onChange={onChange('email')}  />
                <small className={`${errors.email ? 'errors' : ''}`}>{errors.email}</small>
              </div>
              <div className="form-contol">
                <label>ФИО</label>
                <input type="text" value={state.fullname} required onChange={onChange('fullname')} />
                <small className={`${errors.fullname ? 'errors' : ''}`}>{errors.fullname}</small>
              </div>
              <div className="form-contol">
                <label>Номер телефона</label>
                <input type="phone" value={state.phone} required onChange={onChange('phone')} />
                <small className={`${errors.phone ? 'errors' : ''}`}>{errors.phone}</small>
              </div>
              <div className="form-contol">
                <label>Адрес</label>
                <input type="text" value={state.address} required onChange={onChange('address')} />
                <small className={`${errors.address ? 'errors' : ''}`}>{errors.address}</small>
              </div>
              <div className="form-contol">
                <label>Организация</label>
                <input type="text" value={state.organization} required onChange={onChange('organization')} />
                <small className={`${errors.organization ? 'errors' : ''}`}>{errors.organization}</small>
              </div>
              {
                !audiences && isLoading 
                ? <Loader />
                : (
                  <div className="form-contol">
                    <label>Аудитории</label>
                    <select value={state.audience} onChange={onChange('audience')}>
                      {
                        audiences 
                        ? audiences.map((item) => (
                          <option value={item.id} key={item.id}>
                            {item.name}
                          </option>
                        )) 
                        : null
                      }

                    </select>
                  </div>
                )            
              }
              {
                state.audience && isLoading 
                ? <Loader />
                : tags ? (
                  <div className="form-contol mutiple-select">
                    <label>Тэги</label>
                    <span className="multiple-selection">{selectedTags.join(', ')}</span>
                    <select value={state.tag} onChange={onChange('tag')}>
                      <option value="" >
                            {" "}
                      </option>
                      {
                        tagsToShow 
                        ? tagsToShow.map((item) => (
                          <option value={item.id} key={item.id}>
                            {item.name}
                          </option>
                        )) 
                        : null
                      }
                    </select>
                  </div>
                )    
                : null        
              }            
              <div className="submit_container clear">
                <button type="submit" className="submit">Подписаться</button>
              </div>
            </div>
          </form>
        </div>
        <div className="poweredWrapper">
          <span className="poweredBy">
            <a href="http://www.mailchimp.com/email-referral/?utm_source=freemium_newsletter&amp;utm_medium=email&amp;utm_campaign=referral_marketing&amp;aid=2a09abbf5a8dc4dfa4874899c&amp;afl=1">
              <img src="https://cdn-images.mailchimp.com/monkey_rewards/MC_MonkeyReward_15.png" border="0" alt="Email Marketing Powered by Mailchimp" title="Mailchimp Email Marketing" width="139" height="54" />
            </a>
          </span>
        </div>

      </div>
    </div>
  );
}

export default App;
