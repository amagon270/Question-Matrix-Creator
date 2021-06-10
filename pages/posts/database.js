import Layout from '../../components/layout'
import { PrismaClient } from '@prisma/client'

export async function getServerSideProps(context) {
  const prisma = new PrismaClient();

  async function main() {
    const questionTypes = await prisma.questionType.findMany();
    console.log(questionTypes);
  }

  main()
    .catch(e => {
      throw e
    })
    .finally(async () => {
      await prisma.$disconnect()
    })

  return {
    props: {
      // props for your component
    }
  }
}

export default function DatabaseCheck() {
  return (
    <Layout>
      <p>Testing</p>
    </Layout>
  )
}