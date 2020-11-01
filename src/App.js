import React, { useEffect, useRef, useState } from 'react';
import isEmail from 'isemail';
import Loader from './Loader';
import Select from './Select';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

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

    }  else {
      setErrors((state) => ({
        ...state,
        [field]: ''
      }));
    }
  };

  const notifySuccess = () => {
      toast.success('Пользователь добавлен в базу!', {
      position: "top-center",
      autoClose: 5000,
      hideProgressBar: false,
      closeOnClick: true,
      pauseOnHover: true,
      draggable: true,
      progress: undefined,
    });
    setState(initial);
    setSelectedTags([]);
    setTagsToShow(tags);
  };

  const notifyError = () => toast.error('Пользователь не добавлен в базу!', {
    position: "top-center",
    autoClose: 5000,
    hideProgressBar: false,
    closeOnClick: true,
    pauseOnHover: true,
    draggable: true,
    progress: undefined,
  });

  const submit = (e) => {
    e.preventDefault();
    const bodyToSend = {
      audience: state.audience,
      tags: selectedTags.map((option) => option.name),
      contact: {
        email: state.email,
        organization: state.organization,
        fullname: state.fullname,
        address: state.address,
        phone: state.phone
      }
    }
    fetch('/api/addContact', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify(bodyToSend)
    }).then((resp) => {
      if (resp.ok) {
        notifySuccess();
      } else {
        setError('Такой email уже существует!');
        notifyError();
      }
    }).catch((e) => console.log(e));
  };

  useEffect(() => {
    const fetchAudiences = async () => {
      setLoading(true);
      const resp = await fetch('/api/audiences');
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
      const resp = await fetch(`/api/audiences/${state.audience}/tags`);
      const body = await resp.json();
      setTags(body);
      setTagsToShow(body);
      setLoading(false);
    };
    fetchTags();
  }, [ state.audience ]);


  const onOptionSelected = (option) => {
    setSelectedTags((tags) => ([
      ...tags,
      option
    ]));
    setTagsToShow((tags) => {
      return tags.filter((item) => item.id !== option.id);
    });
  };

  const onTagDeleted = (option) => {
    setSelectedTags((tags) => {
        return tags.filter((tag) => tag.id !== option.id)
    });
    setTagsToShow(() => {
      return tags.filter((tag) => {
        const candidateTag = selectedTags.find((item) => item.id == tag.id && item.id !== option.id);
        return !candidateTag;
      })
    });

  };

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
                <div className="form-control">
                  <label>Email</label>
                  <input type="email" required value={state.email} onChange={onChange('email')}  />
                  <small className={`${errors.email ? 'errors' : ''}`}>{errors.email}</small>
                </div>
                <div className="form-control">
                  <label>ФИО</label>
                  <input type="text" value={state.fullname} required onChange={onChange('fullname')} />
                  <small className={`${errors.fullname ? 'errors' : ''}`}>{errors.fullname}</small>
                </div>
                <div className="form-control">
                  <label>Номер телефона</label>
                  <input type="phone" value={state.phone} required onChange={onChange('phone')} />
                  <small className={`${errors.phone ? 'errors' : ''}`}>{errors.phone}</small>
                </div>
                <div className="form-control">
                  <label>Адрес</label>
                  <input type="text" value={state.address} required onChange={onChange('address')} />
                  <small className={`${errors.address ? 'errors' : ''}`}>{errors.address}</small>
                </div>
                <div className="form-control">
                  <label>Организация</label>
                  <input type="text" value={state.organization} required onChange={onChange('organization')} />
                  <small className={`${errors.organization ? 'errors' : ''}`}>{errors.organization}</small>
                </div>
                {
                  !audiences && isLoading
                      ? <Loader />
                      : (
                          <div className="form-control">
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
                          <div className="form-control">
                            <label>Тэги</label>
                            <Select 
                              options={tagsToShow}
                              onOptionSelected={onOptionSelected}
                              selectedOptions={selectedTags}
                              onTagDeleted={onTagDeleted}
                            />
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
        <ToastContainer
            position="top-center"
            autoClose={5000}
            hideProgressBar={false}
            newestOnTop={false}
            closeOnClick
            rtl={false}
            pauseOnFocusLoss
            draggable
            pauseOnHover
        />
      </div>
  );
}

export default App;
