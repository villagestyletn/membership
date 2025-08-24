import { mdiChartTimelineVariant } from '@mdi/js'
import Head from 'next/head'
import React, { ReactElement } from 'react'
import CardBox from '../../components/CardBox'
import LayoutAuthenticated from '../../layouts/Authenticated'
import SectionMain from '../../components/SectionMain'
import SectionTitleLineWithButton from '../../components/SectionTitleLineWithButton'
import { getPageTitle } from '../../config'

import { Field, Form, Formik } from 'formik'
import FormField from '../../components/FormField'
import BaseDivider from '../../components/BaseDivider'
import BaseButtons from '../../components/BaseButtons'
import BaseButton from '../../components/BaseButton'
import FormCheckRadio from '../../components/FormCheckRadio'
import FormCheckRadioGroup from '../../components/FormCheckRadioGroup'
import { SwitchField } from '../../components/SwitchField'

import { SelectField } from '../../components/SelectField'
import {RichTextField} from "../../components/RichTextField";

import { create } from '../../stores/memberships/membershipsSlice'
import { useAppDispatch } from '../../stores/hooks'
import { useRouter } from 'next/router'

const initialValues = {

    name: '',

    role: 'President',

    user: '',

    active: false,

    membership_start_date: '',

    membership_end_date: '',

}

const MembershipsNew = () => {
  const router = useRouter()
  const dispatch = useAppDispatch()

  const handleSubmit = async (data) => {
    await dispatch(create(data))
    await router.push('/memberships/memberships-list')
  }
  return (
    <>
      <Head>
        <title>{getPageTitle('New Item')}</title>
      </Head>
      <SectionMain>
        <SectionTitleLineWithButton icon={mdiChartTimelineVariant} title="New Item" main>
        {''}
        </SectionTitleLineWithButton>
        <CardBox>
          <Formik
            initialValues={
                initialValues
            }
            onSubmit={(values) => handleSubmit(values)}
          >
            <Form>

  <FormField
      label="Name"
  >
      <Field
          name="name"
          placeholder="Name"
      />
  </FormField>

  <FormField label="Role" labelFor="role">
      <Field name="role" id="role" component="select">

        <option value="President">President</option>

        <option value="VicePresident">VicePresident</option>

        <option value="Secretary">Secretary</option>

        <option value="JointSecretary">JointSecretary</option>

        <option value="Treasurer">Treasurer</option>

        <option value="GeneralBodyMember">GeneralBodyMember</option>

        <option value="NormalMember">NormalMember</option>

        <option value="PatronMember">PatronMember</option>

        <option value="AdministrativeMember">AdministrativeMember</option>

        <option value="GeneralMember">GeneralMember</option>

      </Field>
  </FormField>

  <FormField label="User" labelFor="user">
      <Field name="user" id="user" component={SelectField} options={[]} itemRef={'users'}></Field>
  </FormField>

  <FormField label='Active' labelFor='active'>
      <Field
          name='active'
          id='active'
          component={SwitchField}
      ></Field>
  </FormField>

  <FormField
      label="MembershipStartDate"
  >
      <Field
          type="datetime-local"
          name="membership_start_date"
          placeholder="MembershipStartDate"
      />
  </FormField>

  <FormField
      label="MembershipEndDate"
  >
      <Field
          type="datetime-local"
          name="membership_end_date"
          placeholder="MembershipEndDate"
      />
  </FormField>

              <BaseDivider />
              <BaseButtons>
                <BaseButton type="submit" color="info" label="Submit" />
                <BaseButton type="reset" color="info" outline label="Reset" />
                <BaseButton type='reset' color='danger' outline label='Cancel' onClick={() => router.push('/memberships/memberships-list')}/>
              </BaseButtons>
            </Form>
          </Formik>
        </CardBox>
      </SectionMain>
    </>
  )
}

MembershipsNew.getLayout = function getLayout(page: ReactElement) {
  return (
      <LayoutAuthenticated>
          {page}
      </LayoutAuthenticated>
  )
}

export default MembershipsNew
