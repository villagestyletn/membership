import React, { useEffect, useState } from 'react';
import type { ReactElement } from 'react';
import Head from 'next/head';
import BaseButton from '../components/BaseButton';
import CardBox from '../components/CardBox';
import BaseIcon from "../components/BaseIcon";
import { mdiInformation, mdiEye, mdiEyeOff } from '@mdi/js';
import SectionFullScreen from '../components/SectionFullScreen';
import LayoutGuest from '../layouts/Guest';
import { Field, Form, Formik } from 'formik';
import FormField from '../components/FormField';
import FormCheckRadio from '../components/FormCheckRadio';
import BaseDivider from '../components/BaseDivider';
import BaseButtons from '../components/BaseButtons';
import { useRouter } from 'next/router';
import { getPageTitle } from '../config';
import { findMe, loginUser, resetAction } from '../stores/authSlice';
import { useAppDispatch, useAppSelector } from '../stores/hooks';
import Link from 'next/link';
import {toast, ToastContainer} from "react-toastify";
import { getPexelsImage, getPexelsVideo } from '../helpers/pexels'

export default function Login() {
  const router = useRouter();
  const dispatch = useAppDispatch();
  const textColor = useAppSelector((state) => state.style.linkColor);
  const iconsColor = useAppSelector((state) => state.style.iconsColor);
  const notify = (type, msg) => toast(msg, { type });

  const [showPassword, setShowPassword] = useState(false);
  const { currentUser, isFetching, errorMessage, token, notify:notifyState } = useAppSelector(
    (state) => state.auth,
  );
  const [initialValues, setInitialValues] = React.useState({ email:'admin@flatlogic.com',
    password: '169e4de5',
    remember: true })

  const title = 'membership'

  // Fetch user data
  useEffect(() => {
    if (token) {
      dispatch(findMe());
    }
  }, [token, dispatch]);
  // Redirect to dashboard if user is logged in
  useEffect(() => {
    if (currentUser?.id) {
      router.push('/dashboard');
    }
  }, [currentUser?.id, router]);
  // Show error message if there is one
  useEffect(() => {
    if (errorMessage){
      notify('error', errorMessage)
    }

  }, [errorMessage])
  // Show notification if there is one
  useEffect(() => {
      if (notifyState?.showNotification) {
        notify('success', notifyState?.textNotification)
        dispatch(resetAction());
      }
    }, [notifyState?.showNotification])

  const togglePasswordVisibility = () => {
      setShowPassword(!showPassword);
  };

  const handleSubmit = async (value) => {
    const {remember, ...rest} = value
    await dispatch(loginUser(rest));
  };

  const setLogin = (target) => {
    const email = target?.innerText;
    setInitialValues(prev => {
      return {...prev, email, password: '169e4de5'}
    })
  }

  return (
      <div>
        <Head>
          <title>{getPageTitle('Login')}</title>
        </Head>

        <SectionFullScreen bg='violet'>
          <div className={`flex flex-row min-h-screen w-full`}>
            <div className='flex items-center justify-center flex-col space-y-4 w-full lg:w-full'>

                <CardBox id="loginRoles" className='w-full md:w-3/5 lg:w-2/3'>
                  <h2 className="text-4xl font-semibold my-4">{title}</h2>
                  <div className='flex flex-row text-gray-500 justify-between'>
                        <div>
                            <p className='mb-2'>Use{' '}
                                <code className={`cursor-pointer ${textColor} `}
                                      onClick={(e) => setLogin(e.target)}>admin@flatlogic.com</code>{' / '}
                                <code className={`${textColor}`}>169e4de5</code>{' / '}
                                to login as Admin</p>
                            <p>Use <code
                                className={`cursor-pointer ${textColor} `}
                                onClick={(e) => setLogin(e.target)}>client@hello.com</code>{' / '}
                                <code className={`${textColor}`}>bdf98cff36c4</code>{' / '}
                                to login as User</p>
                        </div>
                        <div>
                            <BaseIcon
                                className={`${iconsColor}`}
                                w='w-16'
                                h='h-16'
                                size={48}
                                path={mdiInformation}
                            />
                        </div>
                    </div>
                </CardBox>

                <CardBox className='w-full md:w-3/5 lg:w-2/3'>
                    <Formik
                        initialValues={initialValues}
                        enableReinitialize
                        onSubmit={(values) => handleSubmit(values)}
                    >
                        <Form>
                            <FormField
                                label={'Login'}
                                 help={'Please enter your login'}>
                                <Field name='email' />
                            </FormField>

                            <div className='relative'>
                                <FormField
                                    label={'Password'}
                                     help={'Please enter your password'}>
                                    <Field name='password' type={showPassword ? 'text' : 'password'} />
                                </FormField>
                                <div
                                    className='absolute bottom-8 right-0 pr-3 flex items-center cursor-pointer'
                                    onClick={togglePasswordVisibility}
                                >
                                    <BaseIcon
                                        className='text-gray-500 hover:text-gray-700'
                                        size={20}
                                        path={showPassword ? mdiEyeOff : mdiEye}
                                    />
                                </div>
                            </div>

                            <div className={'flex justify-between'}>
                                <FormCheckRadio type='checkbox' label={'Remember'}>
                                    <Field type='checkbox' name='remember' />
                                </FormCheckRadio>

                                <Link className={`${textColor} text-blue-600`} href={'/forgot'}>
                                    {'Forgot password?'}
                                </Link>
                            </div>

                            <BaseDivider />

                            <BaseButtons>
                                <BaseButton
                                    className={'w-full'}
                                    type='submit'
                                    label={isFetching ? 'Loading...' : 'Login'}
                                    color='info'
                                    disabled={isFetching}
                                />
                            </BaseButtons>
                            <br />
                            <p className={'text-center'}>
                                {'Don’t have an account yet?'}{' '}
                                <Link className={`${textColor}`} href={'/register'}>
                                    {'New Account'}
                                </Link>
                            </p>
                        </Form>
                    </Formik>
                </CardBox>
            </div>
          </div>
        </SectionFullScreen>
        <div className='bg-black text-white flex flex-col text-center justify-center md:flex-row'>
          <p className='py-6 text-sm'>© 2024 <span>{title}</span>. {'© All rights reserved'}</p>
          <Link className='py-6 ml-4 text-sm' href='/privacy-policy/'>
              {'Privacy Policy'}
          </Link>
        </div>
        <ToastContainer />
      </div>
  );
}

Login.getLayout = function getLayout(page: ReactElement) {
  return <LayoutGuest>{page}</LayoutGuest>;
};
