import Image from 'next/image'
import Layout from '../../components/layout'

export async function getServerSideProps(context) {
  return {
    props: {
      // props for your component
    }
  }
}

export default function ImagePost() {
  return (
    <Layout>
      <p>Image</p>
      {YourComponent()}
    </Layout>
  )
}

const YourComponent = () => (
  <Image
    src="/images/profile.png"
    height={150}
    width={200}
    alt="Me"
  />
)
