import { useSession } from 'next-auth/react';
import Link from 'next/link';
import { Col, Row } from 'react-bootstrap';
import TableRow from '../components/tableRow';
import Unauthorized from '../components/unauthorized';
import { getScoreboard } from '../server/scoreFunctions';
import { useRouter } from "next/router";

export default function Scoreboard({ scores }) {
  const router = useRouter();
  const { data: session, status } = useSession();

  if (router.isFallback) return "Loading...";

  const userLink = (username) => {
    return (
      <>
        <Link className='userLink' href={'users/' + username}>
          {username}
        </Link>
        <style jsx>
          {`
						.userLink {
							text-decoration: none;
						}
					`}
        </style>
      </>
    );
  };

  if (session) {
    return (
      <>
        <br />
        <h1 className='txt-center'>Scoreboard</h1>
        <Row className='justify-content-center'>
          <Col className='g-5'>
            <TableRow
              left='Rank'
              middle='Username'
              right='Points'
              variant='header'
            />
            {scores.map((entry, index) => {
              return (
                <TableRow
                  key={index}
                  left={entry.position.toString()}
                  middle={userLink(entry.username)}
                  right={entry.score}
                />
              );
            })}
          </Col>
        </Row>
      </>
    );
  } else {
    return <Unauthorized />;
  }
}

export async function getStaticProps(context) {
  let scores = await getScoreboard();
  if (!scores) {
    scores = [];
  }
  return {
    props: { scores },
    revalidate: 300
  }
}
